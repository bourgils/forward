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

export default {
  info: (msg) => console.log(chalk.cyan(`ℹ️  ${msg}`)),
  warn: (msg) => console.warn(chalk.yellow(`⚠️  ${msg}`)),
  error: (msg) => console.error(chalk.red(`❌  ${msg}`)),
  success: (msg) => console.log(chalk.green(`✔️  ${msg}`)),
  log: (msg) => console.log(chalk.gray(`→ ${msg}`)),
  raw: (msg) => console.log(msg),
  secondary: (msg) => console.log(chalk.gray(msg)),
  box: {
    info: printInBox('cyan'),
    warn: printInBox('yellow'),
    error: printInBox('red'),
    success: printInBox('green'),
    log: printInBox('gray'),
  },
};
