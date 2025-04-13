import serviceFactory from '../services/index.js';
import versionManager from '../lib/VersionManager.js';

class ProgramManager {
  constructor(program) {
    this.program = program;
  }

  start(commands) {
    this.program.version(versionManager.getVersion());

    this.program
      .name('fwd')
      .description('Forward CLI – Isolated runtime for your Node.js projects')
      .showHelpAfterError(true);

    this.program.hook('preAction', serviceFactory.runnerService.runtimeCheck());

    this._registerCommands(commands);

    if (!process.argv.slice(2).length) {
      this.program.outputHelp();
      process.exit(0);
    }

    this.program.parse();
  }

  _registerCommands(commands) {
    commands.forEach((command) => {
      this.program.addCommand(command);
    });
  }
}

export default ProgramManager;
