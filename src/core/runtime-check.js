import logger from './logger.js';
import { hasPackageJson } from './env.js';

export default function runtimeCheck() {
  if (!hasPackageJson()) {
    logger.error('No package.json found');
    logger.raw('Are you in a valid Node.js project?');
    process.exit(1);
  }
}
