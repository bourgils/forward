import { Command } from 'commander';
import { runInTemp } from '../../core/runner.js';
import logger from '../../core/logger.js';

export const execCommand = new Command('exec')
  .description('Run any raw shell command inside the temp environment')
  .argument('[cli] [cmd [args...]]', 'Command with arguments')
  .allowUnknownOption(true)
  .passThroughOptions()
  .action(async (_, __, commandObject) => {
    const { args } = commandObject;

    const cmd = args[0];
    const cmdArgs = args.slice(1);

    if (!cmd) {
      logger.error(`No command provided to exec.`);
      process.exit(1);
    }

    if (cmd === 'fwd') {
      logger.error(`fwd is not allowed to be executed directly.`);
      process.exit(1);
    }

    logger.log(`Executing: ${cmd} ${cmdArgs.join(' ')}`);
    await runInTemp(cmd, cmdArgs);
  });
