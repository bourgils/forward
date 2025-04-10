import { Command } from 'commander';

// This declarations only stands for help
export const pipeCommand = new Command('[command] [args...]')
  .description('Pass through command to the pipe')
  .allowUnknownOption();
