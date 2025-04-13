import logger from '../../../lib/Logger.js';
import serviceFactory from '../../../services/index.js';

const showHandler = async () => {
  const envLinesInfo = await serviceFactory.envService.getEnvLinesInfo();

  if (!envLinesInfo) {
    process.exit(1);
  }

  logger.box.info('Environment Info', envLinesInfo.join('\n'));
};

export default showHandler;
