import { Command } from 'commander';
import { hasPackageJson } from '../../core/env.js';
import logger from '../../core/logger.js';

export const doctorCommand = new Command('doctor')
  .description('Check if your project is fwd compatible')
  .action(async () => {
    if (!hasPackageJson()) {
      logger.error('No package.json found');
      process.exit(1);
    }

    logger.box.success('Doctor', `🩺 The diagnosis is made, your project is valid for \`fwd\`.`);
  });
