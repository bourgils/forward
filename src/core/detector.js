import fs from 'fs';
import path from 'path';

const pipeSignatures = [
  { name: 'vite', files: ['vite.config.js', 'vite.config.ts'], pkg: 'vite' },
  { name: 'next', files: ['next.config.js', 'next.config.mjs'], pkg: 'next' },
  { name: 'nuxt', files: ['nuxt.config.js', 'nuxt.config.ts'], pkg: 'nuxt' },
  { name: 'react-scripts', pkg: 'react-scripts' },
  { name: 'bun', files: ['bun.lockb'] },
  { name: 'astro', pkg: 'astro' },
];

export function detectPipe(cwd = process.cwd()) {
  const pkgJsonPath = path.join(cwd, 'package.json');
  const hasPkgJson = fs.existsSync(pkgJsonPath);
  const pkg = hasPkgJson ? JSON.parse(fs.readFileSync(pkgJsonPath)) : null;

  for (const pipe of pipeSignatures) {
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

  for (const file of commonFiles) {
    if (fs.existsSync(path.join(cwd, file)) && (pkg?.scripts?.start || pkg?.scripts?.dev)) {
      return { pipe: 'node', env: 'backend' };
    }
  }

  return null;
}

export function detectPackageManager(cwd = process.cwd()) {
  const locks = [
    { name: 'pnpm', file: 'pnpm-lock.yaml' },
    { name: 'yarn', file: 'yarn.lock' },
    { name: 'bun', file: 'bun.lockb' },
    { name: 'npm', file: 'package-lock.json' },
  ];

  for (const lock of locks) {
    if (fs.existsSync(path.join(cwd, lock.file))) return lock.name;
  }

  return 'npm';
}

export function detectProjectName(cwd = process.cwd()) {
  return path.basename(cwd);
}

export function detectEnvironment() {
  return {
    projectName: detectProjectName(),
    ...detectPipe(),
    packageManager: detectPackageManager(),
  };
}
