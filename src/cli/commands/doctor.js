import { Command } from 'commander';
import { hasPackageJson, getEnvConfig, getEnvLinesInfo } from '../../core/env.js';
import logger from '../../core/logger.js';

export const doctorCommand = new Command('doctor')
  .description('Check if your project is fwd compatible')
  .action(async () => {
    if (!hasPackageJson()) {
      logger.box.error('Doctor', `🩺 Fwd is made for nodejs projects, but no package.json found`);
      process.exit(1);
    }

    const { currentPipe, currentPackageManager } = await getEnvConfig();

    if (Boolean(currentPipe) || Boolean(currentPackageManager)) {
      logger.raw(`Are you joking? You have an environment already setup 🙄`);
      logger.log(`Take a look, just for refresh your memory...`);
      const envLinesInfo = await getEnvLinesInfo();
      logger.box.info('Doctor Maboul 🤪', envLinesInfo.join('\n'));
      process.exit(1);
    }

    logger.box.success('Doctor', `🩺 The diagnosis is made, your project is valid for \`fwd\``);
  });
