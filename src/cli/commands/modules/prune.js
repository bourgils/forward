import { Command } from 'commander';
import pruneHandler from '../../handlers/modules/prune.js';

export const pruneCommand = new Command('prune')
  .alias('p')
  .description('Inspects directories recursively for modules')
  .argument('[root]', 'Root directory to inspect (default to home directory)')
  .option(
    '-i, --ignore-paths <paths>',
    'Specify paths to ignore during inspection (comma separated)'
  )
  .option(
    '-a, --also <folders>',
    'Specify directory names to look for during inspection (comma separated)'
  )
  .option('-y, --yes', 'Automatically answer yes to all prompts')
  .option('--interactive', 'Run the command in interactive mode')
  .option('--dry-run', 'Dry run the command')
  .action(pruneHandler);
