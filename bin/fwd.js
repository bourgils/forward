#!/usr/bin/env node
import { config } from 'dotenv';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../.env') });

const isDev = process.env.FWD_DEV === 'true';

const entry = isDev
  ? resolve(__dirname, '../src/cli/index.js')
  : resolve(__dirname, '../dist/cli/index.js');

const entryPath = pathToFileURL(entry).href;

const { default: main } = await import(entryPath);
if (typeof main === 'function') {
  if (isDev) {
    console.log(chalk.gray(`💻 Reading with ${chalk.bold(chalk.cyan('FWD_DEV=true'))}`));
  }
  await main();
} else {
  console.error('Error: main function not found in the entry file');
  process.exit(1);
}
