import prettyMs from 'pretty-ms';
import DirectoryManager from '../../../lib/DirectoryManager.js';
import logger from '../../../lib/Logger.js';
import ora from 'ora';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';
import prompts from 'prompts';
import inquirer from 'inquirer';

const pruneHandler = async (root, { also, ignorePaths, all, interactive, dryRun, yes }) => {
  const directoryManager = new DirectoryManager(root, {
    also,
    ignorePaths,
    all,
    interactive,
    dryRun,
  });

  logger.log(`Inspecting ${directoryManager.getRootPath()}…`);

  if (directoryManager.getIgnorePaths().length > 0) {
    logger.info(`Ignoring ${directoryManager.getIgnorePaths().length} paths`);
  }

  const start = Date.now();

  const spinner = ora(`Inspecting from ${chalk.blue(directoryManager.getRootPath())}…`).start();

  const inspectionResults = directoryManager.inspectPath(directoryManager.getRootPath());

  spinner.succeed(
    `Inspected ${chalk.green(inspectionResults.elementsAnalyzed)} elements in ${chalk.green(prettyMs(Date.now() - start))}`
  );

  if (inspectionResults.retainedContent.length === 0) {
    logger.warn('Nothing to prune');
    return;
  }

  if (!yes && !interactive) {
    const { elements, size } = directoryManager.getStatsResults(inspectionResults);

    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: `Prune ${chalk.green(elements)} elements in ${chalk.green(prettyBytes(size))} of data?`,
      initial: false,
    });

    if (!confirm) {
      logger.warn('Prune cancelled');
      return;
    }
  }

  if (interactive) {
    try {
      const { files } = await inquirer.prompt({
        type: 'checkbox',
        name: 'files',
        message: 'Please select what to prune',
        choices: inspectionResults.retainedContent.map((element) => ({
          name: element.realPath,
          value: element,
        })),
      });

      inspectionResults.retainedContent = files;
    } catch {
      logger.error('Error selecting files to prune');
      return;
    }
  }

  const { elements, size } = directoryManager.getStatsResults(inspectionResults);

  if (dryRun) {
    logger.secondary(
      `[Dry run] ${chalk.green(elements)} elements in ${chalk.green(prettyBytes(size))} of data would be removed`
    );
    inspectionResults.retainedContent.forEach((element) => {
      logger.secondary(`\t- ${element.realPath}`);
    });
    logger.warn('Dry run, no changes were made');
    return;
  } else {
    directoryManager.prune(inspectionResults);

    logger.secondary(
      `${chalk.green(elements)} elements in ${chalk.green(prettyBytes(size))} of data removed`
    );
  }
};

export default pruneHandler;
