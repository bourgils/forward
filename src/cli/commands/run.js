import { Command } from 'commander';
import { getPackageManager, getScriptsList } from '../../core/env.js';
import { runInTemp } from '../../core/runner.js';
import logger from '../../core/logger.js';

export const runCommand = new Command('run')
  .description('Run an npm script inside a temporary workspace')
  .argument('<script>', 'Script name defined in package.json')
  .allowUnknownOption()
  .action(async (script, options) => {
    const packageManager = await getPackageManager();

    if (!packageManager) {
      logger.error('No package manager found. Run "fwd init" first.');
      process.exit(1);
    }

    const scriptsList = getScriptsList();
    if (!scriptsList.includes(script)) {
      logger.error(`Script \`${script}\` not found in package.json`);
      process.exit(1);
    }

    const args = ['run', script, ...(options?.args ?? [])];

    logger.log(`Using ${packageManager} to run script: ${script}`);

    await runInTemp(packageManager, args);
  });
