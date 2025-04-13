import { Command } from 'commander';
import addHandler from '../handlers/add.js';

export const addCommand = new Command('add')
  .alias('install')
  .alias('i')
  .description('Add a package to the project')
  .argument('[package]', 'Package to install')
  .allowUnknownOption()
  .action(addHandler);
