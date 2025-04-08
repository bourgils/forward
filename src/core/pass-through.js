import logger from './logger.js';
import { runInTemp } from './runner.js';
import { getSessionConfig } from './session.js';

const registerPassThrough = (program) => {
  program
    .arguments('<command> [args...]')
    .allowUnknownOption()
    .action(async (...args) => {
      const { currentPipe } = await getSessionConfig();
      const command = args[0];
      const commandArgs = args[1];

      if (!currentPipe) {
        logger.error('No pipe found. Run "fwd init" first.');
        process.exit(1);
      }

      logger.log(`Passing through command: ${currentPipe} ${command} ${commandArgs.join(' ')}`);

      await runInTemp(currentPipe, [command, ...commandArgs]);
    });
};

export default registerPassThrough;
