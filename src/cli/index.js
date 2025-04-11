import { Command } from 'commander';
import { runCommand } from './commands/run.js';
import { execCommand } from './commands/exec.js';
import { pipeCommand } from './commands/pipe.js';
import { addCommand } from './commands/add.js';
import { removeCommand } from './commands/remove.js';
import { doctorCommand } from './commands/doctor.js';
import runtimeCheck from '../core/runtime-check.js';
import registerPassThrough from '../core/pass-through.js';
import { envCommand } from './commands/env/index.js';
import { getVersion } from '../core/version.js';
import { httpsCommand } from './commands/https.js';
export function main() {
  const program = new Command();

  program.version(getVersion());

  program
    .name('fwd')
    .description('Forward CLI – Isolated runtime for your Node.js projects')
    .showHelpAfterError(true);

  program.hook('preAction', runtimeCheck);

  // Fwd compatible check
  program.addCommand(doctorCommand);
  // Manage fwd concepts
  program.addCommand(envCommand);
  // Manage fwd executions
  program.addCommand(runCommand);
  program.addCommand(execCommand);
  program.addCommand(pipeCommand);
  program.addCommand(addCommand);
  program.addCommand(removeCommand);
  program.addCommand(httpsCommand);
  registerPassThrough(program);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
  }

  program.parse();
}
