import logger from './logger.js';
import { hasPackageJson } from './env.js';
import path from 'path';
import chalk from 'chalk';

export default function runtimeCheck(thisCommand, actionCommand) {
  if (actionCommand.name() === 'doctor') return;

  if (!hasPackageJson()) {
    logger.error('No package.json found');
    const currentProjectDirectoryName = path.basename(process.cwd());
    logger.raw(
      `Are you that \`${chalk.bold(currentProjectDirectoryName)}\` is a valid nodejs project?`
    );
    process.exit(1);
  }
}
