import { Command } from 'commander';
import doctorHandler from '../handlers/doctor.js';

export const doctorCommand = new Command('doctor')
  .description('Check if your project is fwd compatible')
  .action(doctorHandler);
