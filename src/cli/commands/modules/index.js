import { Command } from 'commander';
import { inspectCommand } from './inspect.js';
import { pruneCommand } from './prune.js';
export const modulesCommand = new Command('modules')
  .alias('m')
  .description('Empowers modules management')
  .showHelpAfterError(true)
  .addCommand(inspectCommand)
  .addCommand(pruneCommand);
