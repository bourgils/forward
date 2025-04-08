import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import logger from './logger.js';
import chalk from 'chalk';

const baseDir = path.join(os.homedir(), '.fwd');
const pipesDir = path.join(baseDir, 'pipes');
const sessionsDir = path.join(baseDir, 'sessions');

function getProjectId(cwd = process.cwd()) {
  return crypto.createHash('md5').update(cwd).digest('hex').slice(0, 8);
}

export async function getSessionPaths() {
  const id = getProjectId();
  const pipeFile = path.join(pipesDir, `${id}.json`);
  const tempDir = path.join(sessionsDir, id);
  await fs.ensureDir(tempDir);
  await fs.ensureDir(pipesDir);
  return { id, tempDir, pipeFile };
}

export async function getSessionConfig() {
  const { pipeFile } = await getSessionPaths();
  if (await fs.pathExists(pipeFile)) {
    return fs.readJson(pipeFile);
  }
  return {};
}

export async function setSessionValue(key, value) {
  const { pipeFile } = await getSessionPaths();
  const current = await getSessionConfig();
  current[key] = value;
  await fs.writeJson(pipeFile, current, { spaces: 2 });
}

export async function getSessionValue(key) {
  const config = await getSessionConfig();
  return config[key] || null;
}

export async function setPipe(pipe) {
  await setSessionValue('currentPipe', pipe);
  await setSessionValue('autoDetectedPipe', pipe);
}

export async function getPipe() {
  return getSessionValue('currentPipe');
}

export async function setPackageManager(pm) {
  await setSessionValue('currentPackageManager', pm);
  await setSessionValue('autoDetectedPackageManager', pm);
}

export async function getPackageManager() {
  return getSessionValue('currentPackageManager');
}

export async function clearPipe() {
  const { pipeFile } = await getSessionPaths();
  if (await fs.pathExists(pipeFile)) {
    await fs.remove(pipeFile);
  }
}

export async function createSession() {
  const { id, tempDir } = await getSessionPaths();
  return { id, tempDir };
}

export async function getSessionLinesInfo() {
  const config = await getSessionConfig();
  const { tempDir } = await getSessionPaths();

  const pkgPath = path.join(process.cwd(), 'package.json');

  if (!config.currentPipe && !config.currentPackageManager) {
    logger.info('No active session found for this project. Run `fwd init`.');
    return;
  }

  const lines = [];

  if (config.currentPipe) {
    lines.push(`📦 Pipe: ${chalk.bold(config.currentPipe)}`);
    if (config.autoDetectedPipe && config.autoDetectedPipe !== config.currentPipe) {
      lines.push(`   (auto-detected: ${chalk.gray(config.autoDetectedPipe)})`);
    }
  }

  if (config.currentPackageManager) {
    lines.push(`🛠  Package Manager: ${chalk.bold(config.currentPackageManager)}`);
    if (
      config.autoDetectedPackageManager &&
      config.autoDetectedPackageManager !== config.currentPackageManager
    ) {
      lines.push(`   (auto-detected: ${chalk.gray(config.autoDetectedPackageManager)})`);
    }
  }

  let scriptsList = [];
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = await fs.readJson(pkgPath);
      scriptsList = Object.keys(pkg.scripts || {});
    } catch {
      scriptsList = [];
    }
  }

  lines.push(scriptsList.length > 0 ? `🧾 Scripts: ${scriptsList.join(', ')}` : '🧾 Scripts: none');

  lines.push(`📁 Session Dir: ${tempDir}`);

  return lines;
}
