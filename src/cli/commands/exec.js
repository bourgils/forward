import { Command } from 'commander';
import execHandler from '../handlers/exec.js';

export const execCommand = new Command('exec')
  .description('Run any raw shell command inside the temp environment')
  .argument('[cmd] [args…]', 'Command with arguments')
  .option('--no-deps', 'Skip dependencies installation')
  .allowUnknownOption(true)
  .passThroughOptions()
  .action(execHandler);
