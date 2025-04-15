import chalk from 'chalk';
import logger from '../../lib/Logger.js';
import serviceFactory from '../../services/index.js';

const addHandler = async (...args) => {
  const packageManager = await serviceFactory.envService.getPackageManager();

  const packages = args[2].args;

  if (packages.length === 0) {
    logger.error('No package provided.');
    process.exit(1);
  }

  const commandArgs = ['install', ...packages];

  logger.info(
    `Using ${chalk.bold(packageManager)} to install package(s): ${chalk.bold(packages.join(', '))}`
  );

  await serviceFactory.runnerService.run(packageManager, commandArgs, { installDeps: false });
};

export default addHandler;
