import logger from '../../lib/Logger.js';
import prompts from 'prompts';
import serviceFactory from '../../services/index.js';
import proxyServer from '../../lib/ProxyServer.js';
import { isRunningWithSudo } from '../../utils/sudo.js';
import repositoryManager from '../../lib/RepositoryManager.js';
import initHandler from './env/init.js';

const runHandler = async (script, options) => {
  const { https, domain, repository } = options;

  if (https && !isRunningWithSudo()) {
    logger.error('--https option needs sudo. Run `sudo fwd run --https`');
    process.exit(1);
  }

  const cleanups = [];

  if (repository) {
    const repositoryPath = await repositoryManager.clone(repository);
    await repositoryManager.enter(repositoryPath);
    cleanups.push(repositoryManager.cleanup.bind(repositoryManager));
    await initHandler(null, { force: true });
  }

  const packageManager = await serviceFactory.envService.getPackageManager();

  const scriptsList = serviceFactory.envService.getScriptsList();

  if (!script || !scriptsList.includes(script)) {
    const scripts = serviceFactory.envService.getScripts();
    if (scripts.length === 0) {
      logger.warn('No scripts found in package.json');
      return;
    }

    if (script) {
      logger.warn(`Script \`${script}\` not found, please select one of the following`);
    }

    const { selected } = await prompts({
      type: 'select',
      name: 'selected',
      message: 'Select a script to run',
      choices: scripts.map(({ name, value }) => ({
        title: `${name} → ${value}`,
        value: name,
      })),
    });

    if (!selected) {
      logger.info('Cancelled.');
      return;
    }

    script = selected;
  }

  const commandArgs = ['run', script];

  logger.log(`Using ${packageManager} to run script: ${script}`);

  let onReadyCallback;

  if (https) {
    onReadyCallback = proxyServer.setup(domain);
    cleanups.push(proxyServer._cleanup.bind(proxyServer));
  }

  return serviceFactory.runnerService.run(packageManager, commandArgs, {
    onReadyCallback,
    cleanups,
  });
};

export default runHandler;
