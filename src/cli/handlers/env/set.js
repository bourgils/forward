import logger from '../../../lib/Logger.js';
import prompts from 'prompts';
import fs from 'fs-extra';
import serviceFactory from '../../../services/index.js';
import pipes from '../../constants/pipes.js';
import packageManagers from '../../constants/package-manager.js';

const setHandler = async () => {
  const config = await serviceFactory.envService.getEnvConfig();

  if (!config.projectName) {
    logger.info('Please run `fwd env init` to initialize the environment before');
    process.exit(0);
  }

  const projectName = serviceFactory.detectorService.detectProjectName();
  logger.info(`Project name: ${projectName}`);

  let scriptsList = [];
  try {
    const pkg = await fs.readJson(serviceFactory.envService.getPackageJsonPath());
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
  const autoDetectedPackageManager = serviceFactory.detectorService.detectPackageManager();

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

  await serviceFactory.envService.setEnvValue('currentPipe', selectedPipe);
  await serviceFactory.envService.setEnvValue('currentPackageManager', selectedPackageManager);
  await serviceFactory.envService.setEnvValue('projectName', projectName);

  logger.success(`Environment configured for "${projectName}":`);
};

export default setHandler;
