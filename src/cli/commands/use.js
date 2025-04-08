import { Command } from 'commander';
import prompts from 'prompts';
import { getSessionConfig, setSessionValue } from '../../core/session.js';
import logger from '../../core/logger.js';

const knownPipes = ['vite', 'next', 'nuxt', 'bun', 'react-scripts', 'astro'];

export const useCommand = new Command('use')
  .description('Manually set the pipe (runtime) for the current project')
  .argument('<pipe>', 'Pipe name (vite, next, etc.)')
  .action(async (pipe) => {
    if (!knownPipes.includes(pipe)) {
      logger.error(`Unknown pipe: ${pipe}`);
      logger.secondary(`Known pipes: ${knownPipes.join(', ')}`);
      process.exit(1);
    }

    const config = await getSessionConfig();
    const autoDetected = config.autoDetectedPipe;

    if (autoDetected && autoDetected !== pipe) {
      logger.warn(`"${pipe}" is not the auto-detected pipe for this project.`);
      logger.secondary(`Auto-detected: ${autoDetected}`);

      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Override auto-detected pipe with "${pipe}"?`,
        initial: false,
      });

      if (!confirm) {
        logger.info('Pipe not changed.');
        return;
      }
    }

    await setSessionValue('currentPipe', pipe);
    logger.success(`Pipe set to "${pipe}" for this project.`);
  });
