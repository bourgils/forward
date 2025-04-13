import logger from '../../lib/Logger.js';
import serviceFactory from '../../services/index.js';

const removeHandler = async (...args) => {
  const packageManager = await serviceFactory.envService.getPackageManager();

  // if (!packageManager) {
  //   logger.error('No package manager found. Run "fwd env init" first.');
  //   process.exit(1);
  // }

  const packages = args[2].args;

  if (packages.length === 0) {
    logger.error('No package provided.');
    process.exit(1);
  }

  const commandArgs = ['uninstall', ...packages];

  logger.log(`Using ${packageManager} to remove package(s): ${packages.join(', ')}`);

  await serviceFactory.runnerService.run(packageManager, commandArgs, { installDeps: false });
};

export default removeHandler;
