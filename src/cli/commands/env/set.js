import { Command } from 'commander';
import setHandler from '../../handlers/env/set.js';

export const setCommand = new Command('set')
  .description('Manually set the environment for the current project')
  .action(setHandler);
