import logger from '../../../lib/Logger.js';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import serviceFactory from '../../../services/index.js';

const resetHandler = async ({ force }) => {
  const { tempDir, envFile } = await serviceFactory.envService.getEnvPaths();

  if (await fs.pathExists(path.join(tempDir, '.fwd.lock'))) {
    logger.error('A Forward process is currently running for this project.');
    logger.secondary('Wait for it to finish before resetting.');
    return;
  }

  const filesToRemove = [];

  if (fs.pathExistsSync(envFile)) {
    filesToRemove.push(envFile);
  }

  if (fs.pathExistsSync(tempDir)) {
    filesToRemove.push(tempDir);
  }

  if (!filesToRemove.length) {
    logger.warn('Nothing to reset — no environment found.');
    return;
  }

  if (!force) {
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to reset the fwd environment for this project?`,
      initial: false,
    });

    if (!confirm) {
      logger.info('Environment was not reset');
      return;
    }
  }

  filesToRemove.forEach((file) => {
    fs.removeSync(file);
  });

  logger.success(`Reset done`);
};

export default resetHandler;
