import serviceFactory from '../../services/index.js';
import logger from '../../lib/Logger.js';

const doctorHandler = async () => {
  if (!serviceFactory.envService.hasPackageJson()) {
    logger.box.error('Doctor', `🩺 Fwd is made for nodejs projects, but no package.json found`);
    process.exit(1);
  }

  const { currentPipe, currentPackageManager } = await serviceFactory.envService.getEnvConfig();

  if (Boolean(currentPipe) || Boolean(currentPackageManager)) {
    logger.raw(`Are you joking? You have an environment already setup 🤦🏽`);
    logger.log(`Take a look, just for refresh your memory...`);
    const envLinesInfo = await serviceFactory.envService.getEnvLinesInfo();
    logger.box.info('Doctor Maboul 🤪', envLinesInfo.join('\n'));
    process.exit(1);
  }

  logger.box.success('Doctor', `🩺 The diagnosis is made, your project is valid for \`fwd\``);
};

export default doctorHandler;
