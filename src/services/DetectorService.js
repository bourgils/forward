import path from 'path';
import fs from 'fs-extra';

const pipeSignatures = [
  { name: 'vite', files: ['vite.config.js', 'vite.config.ts'], pkg: 'vite' },
  { name: 'next', files: ['next.config.js', 'next.config.mjs'], pkg: 'next' },
  { name: 'nuxt', files: ['nuxt.config.js', 'nuxt.config.ts'], pkg: 'nuxt' },
  { name: 'react-scripts', pkg: 'react-scripts' },
  { name: 'bun', files: ['bun.lockb'] },
  { name: 'astro', pkg: 'astro' },
];

const commonFiles = [
  'src/index.js',
  'src/server.js',
  'src/app.js',
  'src/main.js',
  'index.js',
  'server.js',
  'app.js',
  'main.js',
];

const locks = [
  { name: 'pnpm', file: 'pnpm-lock.yaml' },
  { name: 'yarn', file: 'yarn.lock' },
  { name: 'bun', file: 'bun.lockb' },
  { name: 'npm', file: 'package-lock.json' },
];

class DetectorService {
  constructor() {
    this.pipeSignatures = pipeSignatures;
    this.commonFiles = commonFiles;
    this.locks = locks;
  }

  detectPipe(cwd = process.cwd()) {
    const pkgJsonPath = path.join(cwd, 'package.json');
    const hasPkgJson = fs.existsSync(pkgJsonPath);
    const pkg = hasPkgJson ? JSON.parse(fs.readFileSync(pkgJsonPath)) : null;

    for (const pipe of this.pipeSignatures) {
      if (pipe.files) {
        for (const file of pipe.files) {
          if (fs.existsSync(path.join(cwd, file))) return { pipe: pipe.name, env: 'frontend' };
        }
      }

      if (pipe.pkg && pkg) {
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };

        if (allDeps[pipe.pkg]) {
          return { pipe: pipe.name, env: 'frontend' };
        }
      }
    }

    for (const file of this.commonFiles) {
      if (fs.existsSync(path.join(cwd, file)) && (pkg?.scripts?.start || pkg?.scripts?.dev)) {
        return { pipe: 'node', env: 'backend' };
      }
    }

    return null;
  }

  detectPackageManager(cwd = process.cwd()) {
    for (const lock of this.locks) {
      if (fs.existsSync(path.join(cwd, lock.file))) return lock.name;
    }

    return 'npm';
  }

  detectProjectName(cwd = process.cwd()) {
    return path.basename(cwd);
  }

  detectEnvironment() {
    return {
      projectName: this.detectProjectName(),
      ...this.detectPipe(),
      packageManager: this.detectPackageManager(),
    };
  }
}

export default DetectorService;
