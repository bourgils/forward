import { Command } from 'commander';
import { detectEnvironment } from '../../../core/detector.js';
import {
  createEnv,
  getEnvConfig,
  getEnvLinesInfo,
  getEnvPaths,
  setEnv,
  setPackageManager,
  setPipe,
  setProjectName,
} from '../../../core/env.js';

import logger from '../../../core/logger.js';
import chalk from 'chalk';

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

      logger.raw(
        `Please run \`fwd env reset\` then \`fwd env init\` to reinitialize the current environment. Or set manually the environment using \`fwd env set\`.`
      );

      process.exit(1);
    } else {
      logger.raw(
        `Creating a new environment for ${chalk.bold(projectName)} project ${chalk.gray(`(${env})`)}`
      );
      const { tempDir } = await getEnvPaths();

      await createEnv();
      await setEnv(env);
      logger.log(`Setting the pipe to ${chalk.bold(pipe)}`);
      await setPipe(pipe);
      logger.log(`Setting the package manager to ${chalk.bold(packageManager)}`);
      await setPackageManager(packageManager);
      logger.log(`Setting workspace to ${chalk.bold(tempDir)}`);
      await setProjectName(projectName);
    }

    logger.success('Environment initialized');

    // const newEnvLinesInfo = await getEnvLinesInfo();

    // logger.box.info('Environment', newEnvLinesInfo.join('\n'));
  });
