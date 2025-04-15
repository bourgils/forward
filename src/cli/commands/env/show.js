import { Command } from 'commander';
import showHandler from '../../handlers/env/show.js';

export const showCommand = new Command('show')
  .description('Display current environment for this project')
  .alias('s')
  .action(showHandler);
