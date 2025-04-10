import { Command } from 'commander';
import { initCommand } from './init.js';
import { resetCommand } from './reset.js';
import { useCommand } from './use.js';
import { showCommand } from './show.js';

export const envCommand = new Command('env')
  .alias('e')
  .description('Manage fwd environment for current location')
  .showHelpAfterError(true)
  .addCommand(initCommand)
  .addCommand(showCommand)
  .addCommand(useCommand)
  .addCommand(resetCommand);
