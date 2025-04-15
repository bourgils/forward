import chalk from 'chalk';
import boxen from 'boxen';

const boxenOpts = {
  padding: 1,
  margin: 1,
  title: '',
  titleAlignment: 'center',
};

const printInBox = (borderColor) => (title, content) =>
  console.log(boxen(content, { ...boxenOpts, title, borderColor }));

const withSpinContext =
  (spinner, ...msg) =>
  async (callback) => {
    if (spinner) spinner.stop();
    await callback(...msg);
    if (spinner) spinner.start();
  };

class Logger {
  constructor() {
    this.spinContext = {
      info: (spinner, ...msg) => withSpinContext(spinner, ...msg)(this.info.bind(this)),
      warn: (spinner, ...msg) => withSpinContext(spinner, ...msg)(this.warn.bind(this)),
      error: (spinner, ...msg) => withSpinContext(spinner, ...msg)(this.error.bind(this)),
      success: (spinner, ...msg) => withSpinContext(spinner, ...msg)(this.success.bind(this)),
      log: (spinner, ...msg) => withSpinContext(spinner, ...msg)(this.log.bind(this)),
      raw: (spinner, ...msg) => withSpinContext(spinner, ...msg)(this.raw.bind(this)),
    };
  }

  info(...msg) {
    this._log('cyan', 'ℹ', ...msg);
  }

  warn(...msg) {
    this._log('yellow', '⚠', ...msg);
  }

  error(...msg) {
    this._log('red', '✘', ...msg);
  }

  success(...msg) {
    this._log(null, chalk.green('✔'), ...msg);
  }

  log(...msg) {
    this._log('gray', '→', ...msg);
  }

  raw(...msg) {
    this._log(null, null, ...msg);
  }

  secondary(...msg) {
    this._log('gray', null, ...msg);
  }

  _log(color, prefix, ...msg) {
    if (prefix) msg.unshift(prefix);

    if (!color) {
      console.log(...msg);
      return;
    }

    console.log(chalk[color](`${msg.join(' ')}`));
  }
}

Logger.prototype.box = {
  info: printInBox('cyan'),
  warn: printInBox('yellow'),
  error: printInBox('red'),
  success: printInBox('green'),
  log: printInBox('gray'),
};

export default new Logger();
