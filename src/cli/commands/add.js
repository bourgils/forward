import { Command } from 'commander';
import { getPackageManager } from '../../core/session.js';
import logger from '../../core/logger.js';
import { execa } from 'execa';

export const addCommand = new Command('add')
  .alias('install')
  .alias('i')
  .description('Add a package to the project')
  .argument('<package>', 'Package to install')
  .allowUnknownOption()
  .action(async (script, options) => {
    const packageManager = await getPackageManager();

    if (!packageManager) {
      logger.error('No package manager found. Run "fwd init" first.');
      process.exit(1);
    }

    const args = ['install', script, ...(options?.args ?? [])];

    logger.log(`Using ${packageManager} to install package: ${script}`);

    const { stdout, stderr } = await execa(packageManager, args, {
      env: process.env,
    });

    logger.box.info(`${packageManager} install ${script}`, stdout);

    if (stderr) {
      logger.error(`Errors:\n ${stderr}`);
    }
  });
