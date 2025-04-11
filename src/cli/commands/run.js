import { Command } from 'commander';
import { getPackageManager, getScripts, getScriptsList } from '../../core/env.js';
import { runInTemp } from '../../core/runner.js';
import logger from '../../core/logger.js';
import prompts from 'prompts';
import { handleAction } from '../../core/handle-action.js';
import { execa } from 'execa';

export const runAction = async (script, cmdArgs, onReadyCallback) => {
  if (!script) {
    const scripts = getScripts();
    if (scripts.length === 0) {
      logger.warn('No scripts found in package.json');
      return;
    }

    const { selected } = await prompts({
      type: 'select',
      name: 'selected',
      message: 'Select a script to run',
      choices: scripts.map(({ name, value }) => ({
        title: `${name} → ${value}`,
        value: name,
      })),
    });

    if (!selected) {
      logger.info('Cancelled.');
      return;
    }

    script = selected;
  }

  let packageManager = await getPackageManager();

  if (!packageManager) {
    logger.error('No package manager found. Run "fwd env init" first.');
    process.exit(1);
  }

  const scriptsList = getScriptsList();
  if (!scriptsList.includes(script)) {
    logger.error(`Script \`${script}\` not found in package.json`);
    process.exit(1);
  }

  const commandArgs = ['run', script, ...cmdArgs];

  logger.log(`Using ${packageManager} to run script: ${script}`);

  if (onReadyCallback) {
    commandArgs.unshift(packageManager);
    packageManager = 'sudo';
  }

  return runInTemp(packageManager, commandArgs, onReadyCallback);
};

export const runCommand = new Command('run')
  .description('Run an npm script inside a temporary workspace')
  .arguments('[script]', 'Script name defined in package.json')
  .action(handleAction(runAction));
