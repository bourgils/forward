import serviceFactory from '../../services/index.js';
import logger from '../../lib/Logger.js';
import chalk from 'chalk';

const doctorHandler = async () => {
  if (!serviceFactory.envService.hasPackageJson()) {
    logger.error(`Fwd is made for nodejs projects, but ${chalk.red('no package.json found')}`);
    process.exit(1);
  }

  const { currentPipe, currentPackageManager } = await serviceFactory.envService.getEnvConfig();

  if (Boolean(currentPipe) || Boolean(currentPackageManager)) {
    logger.raw(`Are you joking? You have an environment already setup 🤦🏽`);
    logger.log(`Take a look, just for refresh your memory… 🤪`);

    await serviceFactory.envService.showEnvLinesInfo();
    process.exit(1);
  }

  logger.success(`The diagnosis is made, your project is ${chalk.green('valid')} for \`fwd\``);
};

export default doctorHandler;
