import { Command } from 'commander';
import resetHandler from '../../handlers/env/reset.js';

export const resetCommand = new Command('reset')
  .alias('r')
  .description("Reset the current project's Forward workspace (pipe & cache)")
  .option('-f, --force', 'Force reset the workspace')
  .action(resetHandler);
