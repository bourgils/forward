import logger from '../../../lib/Logger.js';
import chalk from 'chalk';
import serviceFactory from '../../../services/index.js';

const initHandler = async (cmd, { force = false }) => {
  const config = await serviceFactory.envService.getEnvConfig();

  const hasExistingWorkspace = !!(config.currentPipe || config.currentPackageManager);

  const { env, pipe, packageManager, projectName } =
    serviceFactory.detectorService.detectEnvironment();

  if (hasExistingWorkspace && !force) {
    logger.secondary(`A fwd environment is already detected for this project.`);

    const envLinesInfo = await serviceFactory.envService.getEnvLinesInfo();
    logger.box.warn('Environment', envLinesInfo.join('\n'));

    logger.raw(
      `Please run \`fwd env reset\` then \`fwd env init\` to reinitialize the current environment. Or set manually the environment using \`fwd env set\`.`
    );

    process.exit(1);
  } else {
    logger.raw(
      `Creating a new environment for ${chalk.bold(projectName)} project ${chalk.gray(`(${env})`)}`
    );
    const { tempDir } = await serviceFactory.envService.getEnvPaths();

    await serviceFactory.envService.createEnv();
    await serviceFactory.envService.setEnv(env);
    logger.log(`Setting the pipe to ${chalk.bold(pipe)}`);
    await serviceFactory.envService.setPipe(pipe);
    logger.log(`Setting the package manager to ${chalk.bold(packageManager)}`);
    await serviceFactory.envService.setPackageManager(packageManager);
    logger.log(`Setting workspace to ${chalk.bold(tempDir)}`);
    await serviceFactory.envService.setProjectName(projectName);
  }

  logger.success('Environment initialized');
};

export default initHandler;
