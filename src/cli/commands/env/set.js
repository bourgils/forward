import { Command } from 'commander';
import prompts from 'prompts';
import {
  getEnvConfig,
  setEnvValue,
  getPackageJsonPath,
  getEnvLinesInfo,
} from '../../../core/env.js';
import { detectProjectName, detectPackageManager } from '../../../core/detector.js';
import logger from '../../../core/logger.js';
import fs from 'fs-extra';
import pipes from '../../constants/pipes.js';
import packageManagers from '../../constants/package-manager.js';

export const setCommand = new Command('set')
  .description('Manually set the environment for the current project')
  .action(async () => {
    const config = await getEnvConfig();

    if (!config.projectName) {
      logger.info('Please run `fwd env init` to initialize the environment before');
      process.exit(0);
    }

    const projectName = detectProjectName();
    logger.info(`Project name: ${projectName}`);

    let scriptsList = [];
    try {
      const pkg = await fs.readJson(getPackageJsonPath());
      scriptsList = Object.keys(pkg.scripts || {});
      if (scriptsList.length > 0) {
        logger.info(`Available scripts: ${scriptsList.join(', ')}`);
      } else {
        logger.info('No scripts found in package.json');
      }
    } catch (error) {
      logger.error(`Error reading package.json: ${error.message}`);
      process.exit(1);
    }

    const autoDetectedPipe = config.autoDetectedPipe;
    const autoDetectedPackageManager = detectPackageManager();

    const { selectedPipe } = await prompts({
      type: 'select',
      name: 'selectedPipe',
      message: 'Select a pipe for this project:',
      choices: pipes.map((pipe) => ({
        title: pipe,
        value: pipe,
        description: pipe === autoDetectedPipe ? '(auto-detected)' : '',
      })),
      initial: autoDetectedPipe ? pipes.indexOf(autoDetectedPipe) : 0,
    });

    if (!selectedPipe) {
      logger.info('Pipe selection cancelled.');
      return;
    }

    const { selectedPackageManager } = await prompts({
      type: 'select',
      name: 'selectedPackageManager',
      message: 'Select a package manager for this project:',
      choices: packageManagers.map((pm) => ({
        title: pm,
        value: pm,
        description: pm === autoDetectedPackageManager ? '(auto-detected)' : '',
      })),
      initial: autoDetectedPackageManager ? packageManagers.indexOf(autoDetectedPackageManager) : 0,
    });

    if (!selectedPackageManager) {
      logger.info('Package manager selection cancelled.');
      return;
    }

    if (
      (autoDetectedPipe && autoDetectedPipe !== selectedPipe) ||
      (autoDetectedPackageManager && autoDetectedPackageManager !== selectedPackageManager)
    ) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Override auto-detected settings?`,
        initial: false,
      });

      if (!confirm) {
        logger.info('Settings not changed.');
        return;
      }
    }

    await setEnvValue('currentPipe', selectedPipe);
    await setEnvValue('currentPackageManager', selectedPackageManager);
    await setEnvValue('projectName', projectName);

    logger.success(`Environment configured for "${projectName}":`);

    const envLinesInfo = await getEnvLinesInfo();

    logger.box.info(`Environment updated`, envLinesInfo.join('\n'));
  });
