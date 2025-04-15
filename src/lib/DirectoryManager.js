import os from 'os';
import path, { basename } from 'path';
import fs from 'fs-extra';
import logger from './Logger.js';
import chalk from 'chalk';
import { matchesAnyPattern } from '../utils/regex.js';
import { fileURLToPath } from 'url';
import { Table } from 'console-table-printer';
import prettyBytes from 'pretty-bytes';

// Constants
const NODE_MODULES_NAME = 'node_modules';
const DEFAULT_ROOT_PATH = os.homedir();
const DEFAULT_ALSO_PATHS = [NODE_MODULES_NAME];
const DEFAULT_IGNORE_PATHS = process.env.FWD_DEV
  ? [path.resolve(fileURLToPath(import.meta.url), '..', '..', '..')]
  : [];
const systemPaths = [
  '/System',
  '/Library',
  '/Applications',
  '/Desktop',
  '/Documents',
  '/Downloads',
  '/Pictures',
  '/Videos',
  '~/System',
  '~/Library',
  '~/Applications',
  '~/Desktop',
  '~/Documents',
  '~/Downloads',
  '~/Pictures',
  '~/Videos',
  '~/Projects',
  '~/Music',
  '/bin',
  '/sbin',
  '/usr',
  '/etc',
  '/var',
  '/opt',
  '/snap',
  '~/bin',
  '~/sbin',
  '~/usr',
  '~/etc',
  '~/var',
  '~/opt',
  '~/snap',
  '/node_modules',
  '~/node_modules',
];

class DirectoryManager {
  constructor(root, { also, ignorePaths, all }) {
    this.rootPath = this._getAbsolutePath(process.cwd(), root || DEFAULT_ROOT_PATH);
    this.alsoPaths = [...DEFAULT_ALSO_PATHS, ...(also?.split(',') || [])];
    this.ignorePaths = this._prepareIgnorePaths([...(ignorePaths?.split(',') || [])], all);

    this._validateRootPath();
  }

  getRootPath() {
    return this.rootPath;
  }

  getAlsoPaths() {
    return this.alsoPaths;
  }

  getIgnorePaths() {
    return this.ignorePaths;
  }

  inspectPath(pathToInspect) {
    const retainedContent = [];
    let elementsAnalyzed = 0;

    if (this._shouldBeIgnoredPath(pathToInspect)) {
      return { retainedContent: [], elementsAnalyzed: 0 };
    }

    let dirContent;
    try {
      dirContent = fs.readdirSync(pathToInspect);
    } catch {
      logger.error(`Failed to read directory: ${chalk.underline(pathToInspect)}`);
      logger.log('Skipping directory…');
      return { retainedContent: [], elementsAnalyzed: 0 };
    }

    for (const dir of dirContent) {
      if (dir === '.' || dir === '..') continue;

      const fullPath = path.join(pathToInspect, dir);
      const isIncluded = this._match(this.alsoPaths, dir);
      const stats = fs.lstatSync(fullPath);
      const isSymlink = stats.isSymbolicLink();

      let realPath = fullPath;
      let isSymlinkBroken = false;
      if (isSymlink) {
        try {
          realPath = fs.realpathSync(realPath);
        } catch {
          isSymlinkBroken = true;
        }
      }

      const type = this._determineType(realPath, isSymlinkBroken);
      elementsAnalyzed += 1;

      if (isIncluded) {
        retainedContent.push(
          this._buildRetainedEntry(dir, realPath, type, isSymlink, isSymlinkBroken)
        );
      }

      if (!isIncluded && type === 'directory') {
        const result = this.inspectPath(fullPath);
        retainedContent.push(...result.retainedContent);
        elementsAnalyzed += result.elementsAnalyzed;
      }
    }

    return { retainedContent, elementsAnalyzed };
  }

  showInspectionResults({ retainedContent, elementsAnalyzed }) {
    const table = new Table({
      color: true,
      truncate: false,
      columns: [
        { name: 'parentPath', title: 'Root', alignment: 'left' },
        { name: 'parentName', title: 'Parent', alignment: 'left' },
        { name: 'name', title: 'Directory', alignment: 'left' },
        { name: 'size', title: 'Size', alignment: 'right' },
      ],
    });

    table.addRows(this._formatRows(retainedContent));
    logger.raw('\n');
    table.printTable();
    logger.raw('\n');

    return { retainedContent, elementsAnalyzed };
  }

  getStatsResults({ retainedContent }) {
    return {
      elements: retainedContent.length,
      size: retainedContent.reduce((acc, curr) => acc + curr.size, 0),
    };
  }

  prune({ retainedContent }) {
    for (const element of retainedContent) {
      try {
        fs.removeSync(element.realPath);
        logger.log(`Removed ${element.realPath}`);
      } catch (err) {
        logger.warn(`Failed to remove ${element.realPath}`, `\n\t↳${chalk.red(err)}`);
      }
    }
  }

  // === Private methods ===

  _prepareIgnorePaths(baseIgnorePaths, all = false) {
    const combined = [...DEFAULT_IGNORE_PATHS, ...baseIgnorePaths];
    if (!all) combined.push(...systemPaths);
    return combined.map((p) => this._getAbsolutePath(this.rootPath, p));
  }

  _getAbsolutePath(base, inputPath) {
    if (inputPath.startsWith('/')) return inputPath;
    if (inputPath.startsWith('~/')) return path.resolve(os.homedir(), inputPath.slice(2));
    return path.resolve(base, inputPath);
  }

  _validateRootPath() {
    const root = path.resolve(this.rootPath);
    if (!fs.existsSync(root)) {
      logger.error(`Root directory does not exist: ${chalk.underline(root)}`);
      process.exit(1);
    }
    if (!fs.statSync(root).isDirectory()) {
      logger.error(`Root appears to be a file: ${chalk.underline(root)}`);
      process.exit(1);
    }
  }

  _match(patterns, name) {
    return matchesAnyPattern(name, patterns);
  }

  _shouldBeIgnoredPath(dirPath) {
    return (
      basename(dirPath).startsWith('.') ||
      this.ignorePaths.some((p) => dirPath.startsWith(p)) ||
      systemPaths.includes(dirPath)
    );
  }

  _determineType(realPath, isSymlinkBroken) {
    if (isSymlinkBroken) return 'broken-symlink';
    return fs.statSync(realPath).isDirectory() ? 'directory' : 'file';
  }

  _buildRetainedEntry(name, realPath, type, isSymlink, isSymlinkBroken) {
    return {
      name,
      isSymlink,
      realPath,
      size: isSymlinkBroken ? 0 : fs.statSync(realPath).size,
      isSymlinkBroken,
      parentName: this._getParentName(realPath),
      parentPath: this._getParentPath(realPath),
      type,
    };
  }

  _formatRows(rows) {
    const maxLen = 50;
    return rows.map((row) => ({
      parentPath: this._truncatePath(this._useTilde(row.parentPath), maxLen),
      parentName: row.parentName,
      name: this._formatName(row),
      size: prettyBytes(row.size),
    }));
  }

  _truncatePath(str, maxLength) {
    return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
  }

  _formatName(row) {
    if (row.isSymlink) {
      return chalk.magenta(row.name) + (row.isSymlinkBroken ? ` ${chalk.red('(broken)')}` : '@');
    }
    return row.type === 'directory' ? chalk.cyan(row.name) : chalk.gray(row.name);
  }

  _useTilde(p) {
    return `${p.replace(os.homedir(), '~')}/`;
  }

  _getParentPath(p) {
    return path.resolve(p, '..');
  }

  _getParentName(p) {
    return basename(path.resolve(this._getParentPath(p), '..'));
  }
}

export default DirectoryManager;
