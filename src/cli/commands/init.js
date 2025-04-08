import { Command } from 'commander';
import prompts from 'prompts';
import { detectEnvironment } from '../../core/detector.js';
import {
  createSession,
  getSessionConfig,
  getSessionLinesInfo,
  setPackageManager,
  setPipe,
} from '../../core/session.js';

import logger from '../../core/logger.js';

export const initCommand = new Command('init')
  .description('Detect and initialize the best pipe and package manager for this project')
  .action(async () => {
    const config = await getSessionConfig();

    const hasExistingSession = !!(config.currentPipe || config.currentPackageManager);

    const { pipe, packageManager } = detectEnvironment();

    if (hasExistingSession) {
      const sessionLinesInfo = await getSessionLinesInfo();

      logger.box.warn('Session Detected', sessionLinesInfo.join('\n'));

      const { override } = await prompts({
        type: 'confirm',
        name: 'override',
        message: 'Override with fresh auto-detected values?',
        initial: false,
      });

      if (!override) {
        logger.success('Keeping existing session config.');
        return;
      }
    }

    if (!pipe) {
      logger.error('No compatible pipe detected in this project.');
      process.exit(1);
    }

    await createSession();

    await setPipe(pipe);
    await setPackageManager(packageManager);

    const newSessionLinesInfo = await getSessionLinesInfo();

    logger.box.info('Session Initialized', newSessionLinesInfo.join('\n'));
  });
