import { Command } from 'commander';
import ProgramManager from '../lib/ProgramManager.js';
import commands from './commands/index.js';

export function main() {
  const program = new Command();

  const programManager = new ProgramManager(program);

  programManager.start(commands);
}

export default main;
