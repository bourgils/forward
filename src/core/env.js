import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import logger from './logger.js';
import chalk from 'chalk';

const baseDir = path.join(os.homedir(), '.fwd');
const envsDir = path.join(baseDir, 'envs');
const workspacesDir = path.join(baseDir, 'workspaces');

function getProjectId(cwd = process.cwd()) {
  return crypto.createHash('md5').update(cwd).digest('hex').slice(0, 8);
}

export async function setProjectName(projectName) {
  await setEnvValue('projectName', projectName);
}

export function getPackageJsonPath() {
  return path.join(process.cwd(), 'package.json');
}

export function hasPackageJson() {
  return fs.existsSync(getPackageJsonPath());
}

export function getScriptsList() {
  let scriptsList = [];
  const pkgPath = getPackageJsonPath();
  if (fs.pathExistsSync(pkgPath)) {
    try {
      const pkg = fs.readJsonSync(pkgPath);
      scriptsList = Object.keys(pkg.scripts || {});
    } catch {
      scriptsList = [];
    }
  }

  return scriptsList;
}

export async function getEnvPaths() {
  const id = getProjectId();
  const pipeFile = path.join(envsDir, `${id}.json`);
  const tempDir = path.join(workspacesDir, id);
  await fs.ensureDir(envsDir);
  return { id, tempDir, pipeFile, workspacesDir, envsDir };
}

export async function getEnvConfig() {
  const { pipeFile } = await getEnvPaths();
  if (fs.pathExistsSync(pipeFile)) {
    return fs.readJson(pipeFile);
  }
  return {};
}

export async function setEnvValue(key, value) {
  const { pipeFile } = await getEnvPaths();
  const current = await getEnvConfig();
  current[key] = value;
  await fs.writeJson(pipeFile, current, { spaces: 2 });
}

export async function getEnvValue(key) {
  const config = await getEnvConfig();
  return config[key] || null;
}

export async function setPipe(pipe) {
  await setEnvValue('currentPipe', pipe);
  await setEnvValue('autoDetectedPipe', pipe);
}

export async function getPipe() {
  return getEnvValue('currentPipe');
}

export async function setPackageManager(pm) {
  await setEnvValue('currentPackageManager', pm);
  await setEnvValue('autoDetectedPackageManager', pm);
}

export async function getPackageManager() {
  return getEnvValue('currentPackageManager');
}

export async function setEnv(env) {
  await setEnvValue('env', env);
}

export async function getEnv() {
  return getEnvValue('env');
}

export async function clearPipe() {
  const { pipeFile } = await getEnvPaths();
  if (await fs.pathExists(pipeFile)) {
    await fs.remove(pipeFile);
  }
}

export async function createEnv() {
  const { id, tempDir } = await getEnvPaths();
  return { id, tempDir };
}

export async function getEnvLinesInfo() {
  const config = await getEnvConfig();
  const { tempDir } = await getEnvPaths();

  const pkgPath = path.join(process.cwd(), 'package.json');

  if (!config.currentPipe && !config.currentPackageManager) {
    logger.info('No active env found for this project. Run `fwd env init`.');
    return;
  }

  const lines = [];

  lines.push(`💻 Project name: ${chalk.bold(config.projectName)}`);
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

  const scriptsList = getScriptsList();

  lines.push(scriptsList.length > 0 ? `🧾 Scripts: ${scriptsList.join(', ')}` : '🧾 Scripts: none');

  lines.push(`📁 Workspace: ${tempDir}`);

  return lines;
}
