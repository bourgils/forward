import { Command } from 'commander';
import initHandler from '../../handlers/env/init.js';

export const initCommand = new Command('init')
  .alias('i')
  .description('Detect and initialize the best environment for this project')
  .option('-f, --force', 'Force initialize the environment')
  .action(initHandler);
