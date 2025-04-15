import { execa } from 'execa';
import { join } from 'path';
import serviceFactory from '../services/index.js';
import logger from './Logger.js';
import prompts from 'prompts';
import fs from 'fs-extra';
import chalk from 'chalk';

let repositoryPath = null;

class RepositoryManager {
  constructor() {
    this.keepClone = false;
  }

  async clone(url, keepClone = false) {
    await this._validateRepositoryUrl(url);
    this.keepClone = keepClone;

    const repositoryName = url.split('/').pop().split('.')[0];

    if (keepClone) {
      repositoryPath = join(process.cwd(), repositoryName);
    } else {
      repositoryPath = join(serviceFactory.envService.repositoriesDir, repositoryName);
    }

    if (fs.existsSync(repositoryPath)) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Repository ${chalk.cyan(repositoryName)} already exists. Pull latest changes?`,
      });

      if (!confirm) {
        return repositoryPath;
      }

      fs.removeSync(repositoryPath);
    }

    try {
      await execa('git', ['clone', url, repositoryPath], {
        stdio: 'inherit',
      });

      logger.success(`Cloned successfully in ${chalk.cyan(repositoryPath)}`);

      return repositoryPath;
    } catch (error) {
      logger.error(`Failed to clone repository: ${error}`);
      await this.cleanup();
      process.exit(1);
    }
  }

  async enter(repositoryPath) {
    this.previousDir = process.cwd();
    process.chdir(repositoryPath);
  }

  async exit() {
    process.chdir(this.previousDir);
  }

  async _validateRepositoryUrl(repositoryUrl) {
    try {
      await execa('git', ['ls-remote', repositoryUrl], {
        stdio: 'ignore',
      });

      return true;
    } catch {
      logger.error(`Repository url is not valid: ${chalk.underline(repositoryUrl)}`);
      process.exit(1);
    }
  }

  async cleanup() {
    const { envFile } = await serviceFactory.envService.getEnvPaths();
    await this.exit();
    if (!this.keepClone) {
      logger.log(`Cleaning up repository…`);

      fs.removeSync(repositoryPath);

      logger.success(`Repository removed from ${chalk.cyan(repositoryPath)}`);

      if (fs.existsSync(envFile)) {
        fs.removeSync(envFile);
        logger.success(`Environment removed`);
      }
    } else {
      logger.secondary(`${chalk.cyan('--keep-clone')} → Repository kept at ${repositoryPath}`);
    }
  }
}

export default new RepositoryManager();
