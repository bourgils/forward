// services/VersionManager.js
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.resolve(__dirname, '../../package.json');

class VersionManager {
  constructor() {
    try {
      this.pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch (error) {
      console.error('Error reading package.json:', error.message);
      this.pkg = { version: '0.0.0' };
    }
  }

  getVersion() {
    return this.pkg.version;
  }
}

export default new VersionManager();
