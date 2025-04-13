import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import crypto from 'crypto';
import logger from '../lib/Logger.js';
import chalk from 'chalk';

class EnvService {
  constructor() {
    this.env = process.env;

    this.baseDir = path.join(os.homedir(), '.fwd');
    this.envsDir = path.join(this.baseDir, 'envs');
    this.workspacesDir = path.join(this.baseDir, 'workspaces');
    this.repositoriesDir = path.join(this.baseDir, 'repositories');

    // Ensure directories exist
    fs.ensureDirSync(this.baseDir);
    fs.ensureDirSync(this.envsDir);
    fs.ensureDirSync(this.workspacesDir);
    fs.ensureDirSync(this.repositoriesDir);
  }

  getProjectId(cwd = process.cwd()) {
    return crypto.createHash('md5').update(cwd).digest('hex').slice(0, 8);
  }

  getProjectName(cwd = process.cwd()) {
    return path.basename(cwd);
  }

  async setProjectName(projectName) {
    await this.setEnvValue('projectName', projectName);
  }

  getPackageJsonPath() {
    return path.join(process.cwd(), 'package.json');
  }

  hasPackageJson() {
    return fs.existsSync(this.getPackageJsonPath());
  }

  getScriptsList() {
    let scriptsList = [];
    const pkgPath = this.getPackageJsonPath();
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

  getScripts() {
    let scriptsList = [];
    const pkgPath = this.getPackageJsonPath();
    if (fs.pathExistsSync(pkgPath)) {
      try {
        const pkg = fs.readJsonSync(pkgPath);
        scriptsList = Object.keys(pkg.scripts || {}).map((name) => ({
          name,
          value: pkg.scripts[name],
        }));
      } catch {
        scriptsList = [];
      }
    }

    return scriptsList;
  }

  async getEnvPaths() {
    const id = this.getProjectId();
    const envFile = path.join(this.envsDir, `${id}.json`);
    const tempDir = path.join(this.workspacesDir, id);
    await fs.ensureDir(this.envsDir);
    return { id, tempDir, envFile, workspacesDir: this.workspacesDir, envsDir: this.envsDir };
  }

  async getEnvConfig() {
    const { envFile } = await this.getEnvPaths();
    if (fs.pathExistsSync(envFile)) {
      return fs.readJson(envFile);
    }
    return {};
  }

  async setEnvValue(key, value) {
    const { envFile } = await this.getEnvPaths();
    const current = await this.getEnvConfig();
    current[key] = value;
    await fs.writeJson(envFile, current, { spaces: 2 });
  }

  async getEnvValue(key) {
    const config = await this.getEnvConfig();
    return config[key] || null;
  }

  async setPipe(pipe) {
    await this.setEnvValue('currentPipe', pipe);
    await this.setEnvValue('autoDetectedPipe', pipe);
  }

  async getPipe() {
    return this.getEnvValue('currentPipe');
  }

  async setPackageManager(pm) {
    await this.setEnvValue('currentPackageManager', pm);
    await this.setEnvValue('autoDetectedPackageManager', pm);
  }

  async getPackageManager() {
    return this.getEnvValue('currentPackageManager');
  }

  async setEnv(env) {
    await this.setEnvValue('env', env);
  }

  async getEnv() {
    return this.getEnvValue('env');
  }

  async clearPipe() {
    const { envFile } = await this.getEnvPaths();
    if (await fs.pathExists(envFile)) {
      await fs.remove(envFile);
    }
  }

  async createEnv() {
    const { id, tempDir } = await this.getEnvPaths();
    return { id, tempDir };
  }

  async getEnvLinesInfo() {
    const config = await this.getEnvConfig();
    const { tempDir } = await this.getEnvPaths();

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

    const scriptsList = this.getScriptsList();

    lines.push(
      scriptsList.length > 0 ? `🧾 Scripts: ${scriptsList.join(', ')}` : '🧾 Scripts: none'
    );

    lines.push(`📁 Workspace: ${tempDir}`);

    return lines;
  }
}

export default EnvService;
