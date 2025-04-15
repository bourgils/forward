import logger from '../../../lib/Logger.js';
import prompts from 'prompts';
import serviceFactory from '../../../services/index.js';
import packageManagers from '../../constants/package-manager.js';
import chalk from 'chalk';

const setHandler = async () => {
  const { currentPackageManager, ...config } = await serviceFactory.envService.getEnvConfig();

  if (!config.projectName) {
    logger.info('Please run `fwd env init` to initialize the environment before');
    process.exit(0);
  }

  const projectName = serviceFactory.detectorService.detectProjectName();

  const autoDetectedPackageManager = serviceFactory.detectorService.detectPackageManager();

  const { selectedPackageManager } = await prompts({
    type: 'select',
    name: 'selectedPackageManager',
    message: 'Select a package manager for this project:',
    choices: packageManagers.map((pm) => ({
      title: pm === currentPackageManager ? `${pm} ${chalk.green('✔')}` : pm,
      value: pm,
      description: pm === autoDetectedPackageManager ? '(auto-detected)' : '',
    })),
    initial: autoDetectedPackageManager ? packageManagers.indexOf(autoDetectedPackageManager) : 0,
  });

  if (!selectedPackageManager) {
    logger.warn('Package manager selection cancelled.');
    return;
  }

  if (autoDetectedPackageManager && autoDetectedPackageManager !== selectedPackageManager) {
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Override auto-detected ${chalk.gray(`(${autoDetectedPackageManager})`)} settings?`,
      initial: false,
    });

    if (!confirm) {
      logger.info('Settings not changed.');
      return;
    }
  }

  await serviceFactory.envService.setEnvValue('currentPackageManager', selectedPackageManager);
  await serviceFactory.envService.setEnvValue('projectName', projectName);

  logger.success(`Environment configured for ${chalk.bold(chalk.cyan(projectName))}`);
};

export default setHandler;
