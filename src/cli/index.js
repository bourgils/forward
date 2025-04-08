import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { runCommand } from './commands/run.js';
import { execCommand } from './commands/exec.js';
import { useCommand } from './commands/use.js';
import { showCommand } from './commands/show.js';
import { resetCommand } from './commands/reset.js';
import { pipeCommand } from './commands/pipe.js';
import registerPassThrough from '../core/pass-through.js';

export function main() {
  const program = new Command();

  program.name('fwd').description('Forward CLI – Isolated runtime for your Node.js projects');

  program.addCommand(initCommand);
  program.addCommand(showCommand);
  program.addCommand(runCommand);
  program.addCommand(execCommand);
  program.addCommand(useCommand);
  program.addCommand(resetCommand);
  program.addCommand(pipeCommand);

  registerPassThrough(program);

  program.parse();
}
