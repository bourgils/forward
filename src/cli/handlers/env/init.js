import logger from '../../../lib/Logger.js';
import chalk from 'chalk';
import serviceFactory from '../../../services/index.js';

const initHandler = async ({ force = false }) => {
  const config = await serviceFactory.envService.getEnvConfig();

  const hasExistingWorkspace = !!(config.currentPipe || config.currentPackageManager);

  const { env, packageManager, projectName } = serviceFactory.detectorService.detectEnvironment();

  if (hasExistingWorkspace && !force) {
    logger.info(`A \`${chalk.bold('fwd')}\` environment is already detected for this project.`);

    await serviceFactory.envService.showEnvLinesInfo();

    logger.raw(
      `Please run \`fwd env reset\` then \`fwd env init\` to reinitialize the current environment. Or set manually the environment using \`fwd env set\`.`
    );

    process.exit(1);
  } else {
    logger.log(
      `Creating a new environment for ${chalk.bold(chalk.cyan(projectName))} project ${chalk.gray(`(${env})`)}…`
    );
    const { tempDir } = await serviceFactory.envService.getEnvPaths();

    await serviceFactory.envService.createEnv();
    await serviceFactory.envService.setEnv(env);
    logger.log(`Setting the package manager to ${chalk.bold(chalk.cyan(packageManager))}`);
    await serviceFactory.envService.setPackageManager(packageManager);
    logger.log(`Setting workspace to ${chalk.bold(chalk.cyan(tempDir))}`);
    await serviceFactory.envService.setProjectName(projectName);
  }

  logger.success('Environment initialized');
};

export default initHandler;
