import { envCommand } from './env/index.js';
import { runCommand } from './run.js';
import { execCommand } from './exec.js';
import { addCommand } from './add.js';
import { removeCommand } from './remove.js';
import { doctorCommand } from './doctor.js';
import { modulesCommand } from './modules/index.js';

export default [
  envCommand,
  runCommand,
  execCommand,
  addCommand,
  removeCommand,
  doctorCommand,
  modulesCommand,
];
