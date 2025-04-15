import prettyMs from 'pretty-ms';
import DirectoryManager from '../../../lib/DirectoryManager.js';
import logger from '../../../lib/Logger.js';
import ora from 'ora';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';

const inspectHandler = async (root, { also, ignorePaths, all }) => {
  const directoryManager = new DirectoryManager(root, { also, ignorePaths, all });

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

  directoryManager.showInspectionResults(inspectionResults);

  const { elements, size } = directoryManager.getStatsResults(inspectionResults);

  logger.secondary(
    `Found ${chalk.green(elements)} elements in ${chalk.green(prettyBytes(size))} of data.`
  );
};

export default inspectHandler;
