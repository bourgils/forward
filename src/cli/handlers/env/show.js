import serviceFactory from '../../../services/index.js';

const showHandler = async () => {
  await serviceFactory.envService.showEnvLinesInfo();
};

export default showHandler;
