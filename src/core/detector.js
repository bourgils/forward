import fs from 'fs';
import path from 'path';

const pipeSignatures = [
  { name: 'vite', files: ['vite.config.js', 'vite.config.ts'], pkg: 'vite' },
  { name: 'next', pkg: 'next' },
  { name: 'nuxt', pkg: 'nuxt' },
  { name: 'react-scripts', pkg: 'react-scripts' },
  { name: 'bun', files: ['bun.lockb'] },
  { name: 'astro', pkg: 'astro' },
];

function detectPipe(cwd = process.cwd()) {
  const pkgJsonPath = path.join(cwd, 'package.json');
  const hasPkgJson = fs.existsSync(pkgJsonPath);
  const pkg = hasPkgJson ? JSON.parse(fs.readFileSync(pkgJsonPath)) : null;

  for (const pipe of pipeSignatures) {
    if (pipe.files) {
      for (const file of pipe.files) {
        if (fs.existsSync(path.join(cwd, file))) return pipe.name;
      }
    }

    if (pipe.pkg && pkg) {
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      if (allDeps[pipe.pkg]) {
        return pipe.name;
      }
    }
  }

  return null;
}

function detectPackageManager(cwd = process.cwd()) {
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

export function detectEnvironment() {
  return {
    pipe: detectPipe(),
    packageManager: detectPackageManager(),
  };
}
