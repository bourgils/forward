import { Command } from 'commander';
import { getSessionLinesInfo } from '../../core/session.js';
import logger from '../../core/logger.js';

export const showCommand = new Command('show')
  .description('Display current pipe and package manager for this project')
  .action(async () => {
    const sessionLinesInfo = await getSessionLinesInfo();

    if (!sessionLinesInfo) {
      process.exit(1);
    }

    logger.box.info('Session Info', sessionLinesInfo.join('\n'));
  });
