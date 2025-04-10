import logger from './logger.js';
import { runInTemp } from './runner.js';
import { getEnvConfig } from './env.js';

const registerPassThrough = (program) => {
  program
    .arguments('<command> [args...]')
    .allowUnknownOption()
    .action(async (...args) => {
      const { currentPipe } = await getEnvConfig();
      const command = args[0];
      const commandArgs = args[1];

      if (!currentPipe) {
        logger.error('No pipe found. Run "fwd init" first.');
        process.exit(1);
      }

      logger.log(
        `Passing command \`${command}\` through the pipe: ${currentPipe} ${command} ${commandArgs.join(' ')}`
      );

      await runInTemp(currentPipe, [command, ...commandArgs]);
    });
};

export default registerPassThrough;
