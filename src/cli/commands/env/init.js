import { Command } from 'commander';
import prompts from 'prompts';
import { detectEnvironment } from '../../../core/detector.js';
import {
  createEnv,
  getEnvConfig,
  getEnvLinesInfo,
  setEnv,
  setPackageManager,
  setPipe,
  setProjectName,
} from '../../../core/env.js';

import logger from '../../../core/logger.js';

export const initCommand = new Command('init')
  .alias('i')
  .description('Detect and initialize the best environment for this project')
  .action(async () => {
    const config = await getEnvConfig();

    const hasExistingWorkspace = !!(config.currentPipe || config.currentPackageManager);

    const { env, pipe, packageManager, projectName } = detectEnvironment();

    if (hasExistingWorkspace) {
      logger.secondary(`A fwd environment is already detected for this project.`);

      const envLinesInfo = await getEnvLinesInfo();
      logger.box.warn('Environment', envLinesInfo.join('\n'));

      logger.raw(`Please run \`fwd env reset\` to reset the current environment.`);

      process.exit(1);
    } else {
      await createEnv();
      await setEnv(env);
      await setPipe(pipe);
      await setPackageManager(packageManager);
      await setProjectName(projectName);
    }

    const newEnvLinesInfo = await getEnvLinesInfo();

    logger.box.info('Environment', newEnvLinesInfo.join('\n'));
  });
