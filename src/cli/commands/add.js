import { Command } from 'commander';
import { getPackageManager, getEnvPaths } from '../../core/env.js';
import logger from '../../core/logger.js';
import { execa } from 'execa';
import path from 'path';
import fs from 'fs-extra';

export const addCommand = new Command('add')
  .alias('install')
  .alias('i')
  .description('Add a package to the project')
  .argument('<package>', 'Package to install')
  .allowUnknownOption()
  .action(async (...args) => {
    const packageManager = await getPackageManager();
    const { tempDir } = await getEnvPaths();

    if (!packageManager) {
      logger.error('No package manager found. Run "fwd env init" first.');
      process.exit(1);
    }

    const packages = args[2].args;

    const commandArgs = ['install', ...packages];

    logger.log(`Using ${packageManager} to install package(s): ${packages.join(', ')}`);

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
      const src = path.join(process.cwd(), file);
      const dest = path.join(tempDir, file);
      if (fs.pathExistsSync(src)) {
        fs.ensureSymlinkSync(src, dest, 'junction');
        copied.push(file);
      }
    }

    const { stdout, stderr } = await execa(packageManager, commandArgs, {
      cwd: tempDir,
      env: {
        ...process.env,
        PATH: `${path.join(tempDir, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}`,
      },
    });

    logger.box.info(`${packageManager} install ${packages.join(', ')}`, stdout);

    fs.removeSync(tempDir);

    if (stderr) {
      logger.error(`Errors:\n ${stderr}`);
    }
  });
