import { Command } from 'commander';
import removeHandler from '../handlers/remove.js';

export const removeCommand = new Command('remove')
  .alias('uninstall')
  .description('Remove a package from the project')
  .argument('[package]', 'Package to remove')
  .allowUnknownOption()
  .action(removeHandler);
