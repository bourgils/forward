import logger from '../../lib/Logger.js';
import serviceFactory from '../../services/index.js';

const execHandler = async (args, options) => {
  const { noDeps } = options;

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
  await serviceFactory.runnerService.run(cmd, cmdArgs, { installDeps: !noDeps });
};

export default execHandler;
