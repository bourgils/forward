import { Command } from 'commander';
import prompts from 'prompts';
import path from 'path';
import fs from 'fs-extra';
import { getEnvPaths } from '../../../core/env.js';
import logger from '../../../core/logger.js';

export const resetCommand = new Command('reset')
  .alias('r')
  .description("Reset the current project's Forward workspace (pipe & cache)")
  .action(async () => {
    const { tempDir, pipeFile } = await getEnvPaths();

    if (await fs.pathExists(path.join(tempDir, '.fwd.lock'))) {
      logger.error('A Forward process is currently running for this project.');
      logger.secondary('Wait for it to finish before resetting.');
      return;
    }

    const filesToRemove = [];

    if (fs.pathExistsSync(pipeFile)) {
      filesToRemove.push(pipeFile);
    }

    if (fs.pathExistsSync(tempDir)) {
      filesToRemove.push(tempDir);
    }

    if (!filesToRemove.length) {
      logger.warn('Nothing to reset — no environment found.');
      return;
    }

    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to reset the fwd environment for this project?`,
      initial: false,
    });

    if (!confirm) {
      logger.info('Environment was not reset.');
      return;
    }

    filesToRemove.forEach((file) => {
      fs.removeSync(file);
    });

    logger.success(`Reset done.`);
  });
