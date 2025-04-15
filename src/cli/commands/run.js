import { Command } from 'commander';
import runHandler from '../handlers/run.js';

export const runCommand = new Command('run')
  .description('Run an npm script inside a temporary workspace')
  .arguments('[script]', 'Script name defined in package.json')
  .option('-h, --https', 'Enable HTTPS proxy')
  .option('-d, --domain <domain>', 'Custom domain (only used with --https)')
  .option('-r, --repository <url>', 'Use a remote repository on the fly')
  .option('-k, --keep-clone', 'Keep the cloned repository after running the script')
  .action(runHandler);
