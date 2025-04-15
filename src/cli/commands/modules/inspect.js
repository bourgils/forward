import { Command } from 'commander';
import inspectHandler from '../../handlers/modules/inspect.js';

export const inspectCommand = new Command('inspect')
  .alias('i')
  .description(
    'Inspects directories recursively for modules, by default it ignores system and hidden paths'
  )
  .argument('[root]', 'Root directory to inspect (default to home directory)')
  .option(
    '-i, --ignore-paths <paths>',
    'Specify paths to ignore during inspection (comma separated)'
  )
  .option(
    '-a, --also <folders>',
    'Specify directory names to look for during inspection (comma separated)'
  )
  .option('--all', 'Remove default system and hidden paths from ignore list')
  .action(inspectHandler);
