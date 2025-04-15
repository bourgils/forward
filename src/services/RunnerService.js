import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import prettyMs from 'pretty-ms';
import prettyBytes from 'pretty-bytes';
import logger from '../lib/Logger.js';
import chalk from 'chalk';
import { getFolderSize } from '../utils/folder.js';
import prompts from 'prompts';

class RunnerService {
  constructor(envService) {
    this.alive = true;
    this.envService = envService;
  }

  async run(
    pipe,
    args = [],
    { installDeps = true, onReadyCallback, cwd = process.cwd(), cleanups = [] }
  ) {
    this.start = Date.now();
    this.cwd = cwd;
    this.pipe = pipe;
    this.args = args;
    this.onReadyCallback = onReadyCallback;
    this.cleanups = cleanups;
    const { tempDir } = await this.envService.getEnvPaths();
    this.tempDir = tempDir;
    this.lockPath = path.join(tempDir, '.fwd.lock');
    this.realNodeModules = path.join(cwd, 'node_modules');
    this.tempNodeModules = path.join(tempDir, 'node_modules');
    this.copied = [];
    this.linked = false;

    await this._prepareEnv();
    await this._copyFiles();

    if (installDeps) {
      await this._installDependencies();
      await this._linkNodeModules();
    } else {
      logger.info('Skipping dependencies installation');
    }
    try {
      return await this._runPipe();
    } catch (error) {
      if (!error.message.includes('CTRL-C')) {
        logger.error(error);
      }
      await this._clean();
    }
  }

  runtimeCheck() {
    return this._runtimeHook.bind(this);
  }

  async _runtimeHook(thisCommand, actionCommand) {
    const byPassedCommands = ['doctor', 'inspect', 'prune', 'init'];

    const options = actionCommand.options || [];
    const hasRepositoryOptionDefined = options.some(
      (opt) => opt.long === '--repository' || opt.short === '-r'
    );

    const repositoryValue = actionCommand.opts().repository;
    const hasRepositoryOptionPassed = repositoryValue !== undefined && hasRepositoryOptionDefined;

    if (byPassedCommands.includes(actionCommand.name()) || hasRepositoryOptionPassed) return;

    if (!this.envService.hasPackageJson()) {
      logger.error('No package.json found');
      const currentProjectDirectoryName = path.basename(process.cwd());
      logger.raw(
        `Are you sure that \`${chalk.bold(currentProjectDirectoryName)}\` is a valid nodejs project?`
      );
      process.exit(1);
    }
  }

  async _prepareEnv() {
    await fs.emptyDir(this.tempDir);
    await fs.writeFile(this.lockPath, Date.now().toString());
  }

  async _copyFiles() {
    const criticalFiles = [
      'package.json',
      'vite.config.js',
      'vite.config.ts',
      'vite.config.mjs',
      'next.config.js',
      'next.config.mjs',
      '.env',
      '.env.local',
      'tsconfig.json',
      'jsconfig.json',
      'package-lock.json',
      'pnpm-lock.yaml',
      'yarn.lock',
      'bun.lockb',
    ];

    for (const file of criticalFiles) {
      const src = path.join(this.cwd, file);
      const dest = path.join(this.tempDir, file);
      if (fs.pathExistsSync(src)) {
        fs.ensureSymlinkSync(src, dest, 'junction');
        this.copied.push(file);
      }
    }

    this.packageManager = await this.envService.getPackageManager();
    const lockFiles = {
      npm: 'package-lock.json',
      pnpm: 'pnpm-lock.yaml',
      yarn: 'yarn.lock',
      bun: 'bun.lockb',
    };

    const lockFile = lockFiles[this.packageManager];
    if (lockFile && fs.pathExistsSync(path.join(this.cwd, lockFile))) {
      fs.copySync(path.join(this.cwd, lockFile), path.join(this.tempDir, lockFile));
      this.copied.push(lockFile);
    }

    logger.info(`Workspace dir: ${chalk.bold(this.tempDir)}`);
    logger.info(`Symlink to: ${chalk.bold(this.copied.join(', '))}`);
  }

  async _installDependencies() {
    if (fs.pathExistsSync(this.realNodeModules)) {
      logger.warn(`It looks like you have ${chalk.bold('node_modules')} folder in your project`);

      const answer = await prompts({
        type: 'confirm',
        name: 'remove',
        message: 'Do you want to remove it?',
      });

      if (answer.remove) {
        fs.removeSync(this.realNodeModules);
      }
    }

    this.env = {
      ...process.env,
      PATH: `${path.join(this.tempDir, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}`,
    };

    logger.log(`Installing dependencies with ${chalk.bold(this.packageManager)}…`);

    const subprocess = execa(this.packageManager, ['install'], {
      cwd: this.tempDir,
      env: this.env,
    });

    this._setupSignalCleanup();

    try {
      const { stdout, stderr } = await subprocess;
      if (stdout) logger.box.info(`${this.packageManager} install`, stdout);
      if (stderr) logger.box.error('Installation errors', stderr);
    } catch (error) {
      logger.error(`${this.packageManager} install failed: ${error.message}`);
      await this._clean();
    }
  }

  async _linkNodeModules() {
    if (!fs.pathExistsSync(this.realNodeModules) && fs.pathExistsSync(this.tempNodeModules)) {
      logger.log('Linking temp dependencies into project…');
      fs.ensureSymlinkSync(this.tempNodeModules, this.realNodeModules, 'junction');
      this.linked = true;
      logger.success('Linked');
    }
  }

  async _runPipe() {
    logger.raw('\n');
    logger.info(`Running: ${chalk.bold(`${this.pipe} ${this.args.join(' ')}`)}\n`);

    const child = execa(this.pipe, this.args, {
      cwd: this.cwd,
      stdio: 'inherit',
      env: this.env,
    });

    if (this.onReadyCallback) {
      await this.onReadyCallback(child);
    }

    this._setupSignalCleanup();

    return child;
  }

  _setupSignalCleanup() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'exit'];
    signals.forEach((signal) => {
      process.once(signal, async () => {
        await this._clean();
      });
    });
  }

  async _clean() {
    if (!this.alive) return;
    this.alive = false;

    logger.raw('\n');

    if (fs.pathExistsSync(this.lockPath) && fs.lstatSync(this.lockPath).isFile()) {
      fs.removeSync(this.lockPath);
    }

    let sizeBefore = 0;

    if (
      fs.pathExistsSync(this.tempNodeModules) &&
      fs.pathExistsSync(this.realNodeModules) &&
      fs.lstatSync(this.realNodeModules).isSymbolicLink()
    ) {
      logger.log('Removing linked node_modules from project…');
      sizeBefore = getFolderSize(this.tempNodeModules);
      fs.removeSync(this.realNodeModules);
      fs.removeSync(this.tempNodeModules);
    }

    if (fs.pathExistsSync(this.tempDir) && fs.lstatSync(this.tempDir).isDirectory()) {
      try {
        sizeBefore = getFolderSize(this.tempDir);
        fs.removeSync(this.tempDir);
      } catch {
        //
      }
    }

    if (this.cleanups && this.cleanups.length > 0) {
      for (const cleanup of this.cleanups) {
        try {
          await cleanup();
        } catch (error) {
          logger.error('Error during custom cleanup:', error);
        }
      }
    }

    logger.log('Cleaning up workspace…');

    const duration = Date.now() - this.start;

    logger.success('Cleaned up');

    logger.box.success(
      'Workspace removed',
      [
        `💾 ${prettyBytes(sizeBefore)} freed from disk`,
        `💨 Workspace lasted ${prettyMs(duration)}`,
      ].join('\n')
    );

    process.exit(0);
  }
}

export default RunnerService;
