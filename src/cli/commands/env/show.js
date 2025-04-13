import { Command } from 'commander';
import showHandler from '../../handlers/env/show.js';

export const showCommand = new Command('show')
  .description('Display current pipe and package manager for this project')
  .alias('s')
  .action(showHandler);
