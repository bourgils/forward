import { Command } from 'commander';
import { getEnvLinesInfo } from '../../../core/env.js';
import logger from '../../../core/logger.js';

export const showCommand = new Command('show')
  .description('Display current pipe and package manager for this project')
  .alias('s')
  .action(async () => {
    const envLinesInfo = await getEnvLinesInfo();

    if (!envLinesInfo) {
      process.exit(1);
    }

    logger.box.info('Environment Info', envLinesInfo.join('\n'));
  });
