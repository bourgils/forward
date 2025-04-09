import { Command } from 'commander';
import { getPackageManager } from '../../core/session.js';
import logger from '../../core/logger.js';
import { execa } from 'execa';

export const removeCommand = new Command('remove')
  .alias('uninstall')
  .description('Remove a package from the project')
  .argument('<package>', 'Package to remove')
  .allowUnknownOption()
  .action(async (script, options) => {
    const packageManager = await getPackageManager();

    if (!packageManager) {
      logger.error('No package manager found. Run "fwd init" first.');
      process.exit(1);
    }

    const args = ['remove', script, ...(options?.args ?? [])];

    logger.log(`Using ${packageManager} to remove package: ${script}`);

    const { stdout, stderr } = await execa(packageManager, args, {
      env: process.env,
    });

    logger.box.info(`${packageManager} remove ${script}`, stdout);

    if (stderr) {
      logger.error(`Errors:\n ${stderr}`);
    }
  });
