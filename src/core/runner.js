import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { getSessionPaths, getPackageManager } from './session.js';
import prettyBytes from 'pretty-bytes';
import logger from './logger.js';

async function getFolderSize(folderPath) {
  let total = 0;

  async function walk(dir) {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        await walk(fullPath);
      } else {
        total += stat.size;
      }
    }
  }

  await walk(folderPath);
  return total;
}

const cwd = process.cwd();
let alive = true;

export async function runInTemp(pipe, args = []) {
  const { tempDir } = await getSessionPaths();

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
  ];

  for (const file of criticalFiles) {
    const src = path.join(cwd, file);
    const dest = path.join(tempDir, file);
    if (await fs.pathExists(src)) {
      await fs.copy(src, dest);
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
  if (lockFile && (await fs.pathExists(path.join(cwd, lockFile)))) {
    await fs.copy(path.join(cwd, lockFile), path.join(tempDir, lockFile));
    copied.push(lockFile);
  }

  const env = {
    ...process.env,
    PATH: `${path.join(tempDir, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}`,
  };

  logger.raw(`📁 Session dir: ${tempDir}`);
  logger.raw(`📦 Copied: ${copied.join(', ')}`);
  logger.raw(`📥 Installing with ${packageManager}...`);

  const { stdout, stderr } = await execa(packageManager, ['install'], {
    cwd: tempDir,
    env,
  });

  logger.box.info(`${packageManager} install`, stdout);

  if (stderr) {
    logger.error(`Errors:\n ${stderr}`);
  }

  const realNodeModules = path.join(cwd, 'node_modules');
  const tempNodeModules = path.join(tempDir, 'node_modules');

  let linked = false;
  if (!(await fs.pathExists(realNodeModules))) {
    logger.raw('🔗 Linking temp node_modules into project...');
    await fs.ensureSymlink(tempNodeModules, realNodeModules, 'junction');
    linked = true;
  }

  logger.raw(`\n🚀 Running: ${pipe} ${args.join(' ')}\n`);

  const child = execa(pipe, args, {
    cwd,
    stdio: 'inherit',
    env,
  });

  const clean = async () => {
    if (!alive) return;
    alive = false;

    if (await fs.pathExists(lockPath)) {
      await fs.remove(lockPath);
    }

    if (linked && (await fs.pathExists(realNodeModules))) {
      const stat = await fs.lstat(realNodeModules);
      if (stat.isSymbolicLink()) {
        logger.raw('🧹 Removing linked node_modules from project...');
        await fs.remove(realNodeModules);
      }
    }

    const sizeBefore = await getFolderSize(tempDir);

    logger.raw('\n🧹 Cleaning up session...');

    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }

    logger.box.success('🧹 Session removed', `💾 ${prettyBytes(sizeBefore)} freed from disk`);

    process.exit(0);
  };

  process.on('SIGINT', clean);
  process.on('SIGTERM', clean);
  process.on('exit', clean);

  try {
    await child;
  } catch (error) {
    if (error.message.includes(`Command failed`)) {
      logger.error(`Failed to run command: ${error.message}`);
    }
    await clean();
  }
}
