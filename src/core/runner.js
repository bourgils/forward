import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import prettyMs from 'pretty-ms';
import { getEnvPaths, getPackageManager } from './env.js';
import prettyBytes from 'pretty-bytes';
import logger from './logger.js';

function getFolderSize(folderPath) {
  let total = 0;

  function walk(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        total += stat.size;
      }
    }
  }

  walk(folderPath);
  return total;
}

const cwd = process.cwd();
let alive = true;

export async function runInTemp(pipe, args = [], onReadyCallback) {
  const start = Date.now();
  const { tempDir } = await getEnvPaths();

  await fs.emptyDir(tempDir);

  const lockPath = path.join(tempDir, '.fwd.lock');
  await fs.writeFile(lockPath, Date.now().toString());

  const copied = [];
  const criticalFiles = [
    'package.json',
    'vite.config.js',
    'vite.config.ts',
    'vite.config.mjs',
    'next.config.js',
    'next.config.mjs',
    '.env',
    '.env.local',
    'tsconfig.json',
    'jsconfig.json',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'bun.lockb',
  ];

  for (const file of criticalFiles) {
    const src = path.join(cwd, file);
    const dest = path.join(tempDir, file);
    if (fs.pathExistsSync(src)) {
      fs.ensureSymlinkSync(src, dest, 'junction');
      copied.push(file);
    }
  }

  const packageManager = await getPackageManager();
  const lockFiles = {
    npm: 'package-lock.json',
    pnpm: 'pnpm-lock.yaml',
    yarn: 'yarn.lock',
    bun: 'bun.lockb',
  };

  const lockFile = lockFiles[packageManager];
  if (lockFile && fs.pathExistsSync(path.join(cwd, lockFile))) {
    fs.copySync(path.join(cwd, lockFile), path.join(tempDir, lockFile));
    copied.push(lockFile);
  }

  const env = {
    ...process.env,
    PATH: `${path.join(tempDir, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}`,
  };

  let linked = false;

  logger.log(`Workspace dir: ${tempDir}`);
  logger.log(`Copied: ${copied.join(', ')}`);
  logger.log(`Installing with ${packageManager}...`);

  const subprocess = execa(packageManager, ['install'], {
    cwd: tempDir,
    env,
  });

  const clean = async () => {
    if (!alive) return;
    alive = false;

    if (fs.pathExistsSync(lockPath) && fs.lstatSync(lockPath).isFile()) {
      fs.removeSync(lockPath);
    }
    logger.raw('\n');
    if (linked && fs.pathExistsSync(realNodeModules)) {
      logger.log('Removing linked node_modules from project...');
      fs.removeSync(tempNodeModules);
      fs.removeSync(realNodeModules);
    }

    logger.log('Cleaning up workspace...');

    let sizeBefore = 0;
    if (fs.pathExistsSync(tempDir) && fs.lstatSync(tempDir).isDirectory()) {
      sizeBefore = getFolderSize(tempDir);
      fs.removeSync(tempDir);
    }

    const duration = Date.now() - start;

    logger.box.success(
      'Workspace removed',
      [
        `💾 ${prettyBytes(sizeBefore)} freed from disk`,
        `💨 Workspace lasted ${prettyMs(duration)}`,
      ].join('\n')
    );

    process.exit(0);
  };

  ['SIGINT', 'SIGTERM', 'SIGHUP', 'exit'].forEach((signal) => {
    process.once(signal, async () => {
      subprocess.kill(signal);
      clean();
    });
  });

  try {
    const { stdout, stderr } = await subprocess;

    if (stdout) {
      logger.box.info(`${packageManager} install`, stdout);
    }

    if (stderr) {
      logger.error(`Errors:\n ${stderr}`);
    }
  } catch (error) {
    logger.error(`${packageManager} install failed: ${error.message}`);
    await clean();
  }

  const realNodeModules = path.join(cwd, 'node_modules');
  const tempNodeModules = path.join(tempDir, 'node_modules');

  if (!fs.pathExistsSync(realNodeModules)) {
    logger.log('Linking temp node_modules into project...');
    fs.ensureSymlinkSync(tempNodeModules, realNodeModules, 'junction');
    linked = true;
  }

  logger.log(`Running: ${pipe} ${args.join(' ')}\n`);

  const child = execa(pipe, args, {
    cwd,
    stdio: 'inherit',
    env,
  });

  if (onReadyCallback) {
    await onReadyCallback(child);
  }

  return child;
}
