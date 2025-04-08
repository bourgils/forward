import { Command } from 'commander';
import { getPackageManager } from '../../core/session.js';
import { runInTemp } from '../../core/runner.js';
import logger from '../../core/logger.js';

export const runCommand = new Command('run')
  .description('Run an npm script inside a temporary session')
  .argument('<script>', 'Script name defined in package.json')
  .allowUnknownOption()
  .action(async (script, options) => {
    const packageManager = await getPackageManager();

    if (!packageManager) {
      logger.error('No package manager found. Run "fwd init" first.');
      process.exit(1);
    }

    const args = ['run', script, ...(options?.args ?? [])];

    logger.log(`Using ${packageManager} to run script: ${script}`);

    await runInTemp(packageManager, args);
  });
