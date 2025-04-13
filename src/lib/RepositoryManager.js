import { execa } from 'execa';
import { join } from 'path';
import serviceFactory from '../services/index.js';
import logger from './Logger.js';
import prompts from 'prompts';
import fs from 'fs-extra';
import chalk from 'chalk';

let repositoryPath = null;

class RepositoryManager {
  async clone(url) {
    await this._validateRepositoryUrl(url);

    const repositoryName = url.split('/').pop().split('.')[0];

    repositoryPath = join(serviceFactory.envService.repositoriesDir, repositoryName);

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

      logger.success(
        `Repository ${chalk.cyan(repositoryName)} cloned in ${chalk.cyan(repositoryPath)}`
      );

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
    logger.log(`Cleaning up repository at ${repositoryPath}`);
    fs.removeSync(repositoryPath);
    if (fs.existsSync(envFile)) {
      fs.removeSync(envFile);
    }
  }
}

export default new RepositoryManager();
