import fs from 'fs';
import logger from './Logger.js';
import { execa } from 'execa';
import os from 'os';

const HOSTS_PATH = '/etc/hosts';

class DomainManager {
  async writeToHosts(domain) {
    const line = `127.0.0.1\t${domain}`;
    const content = fs.readFileSync(HOSTS_PATH, 'utf8');

    if (content.includes(line)) {
      logger.info(`${domain} is already in /etc/hosts`);
      return false;
    }

    logger.log(`Updating /etc/hosts...`);

    try {
      await execa('sudo', ['sh', '-c', `echo "${line}" >> ${HOSTS_PATH}`], {
        stdio: 'inherit',
      });
      logger.success(`Added ${domain} → 127.0.0.1`);
      await this._flushDns(true);
    } catch (err) {
      logger.error('Failed to update /etc/hosts:', err.message);
      logger.warn('Please update /etc/hosts manually.');
      return false;
    }
  }

  async removeFromHosts(domain) {
    try {
      const content = fs.readFileSync(HOSTS_PATH, 'utf8');
      const isLineAdded = content.includes(`127.0.0.1\t${domain}`);
      if (!isLineAdded) {
        return false;
      }
      const regex = new RegExp(`.*\\s${domain}\\s*\\n?`, 'g');
      const newContent = content.replace(regex, '');
      fs.writeFileSync(HOSTS_PATH, newContent);
      logger.success(`Removed ${domain} from /etc/hosts`);
      await this._flushDns();
    } catch (err) {
      logger.warn('Could not clean /etc/hosts. Try manually:', err.message);
      return false;
    }
  }

  isLikelyPublicDomain(domain) {
    return (
      domain.endsWith('.com') ||
      domain.endsWith('.io') ||
      domain.endsWith('.net') ||
      domain.endsWith('.fr') ||
      domain.endsWith('.ai') ||
      domain.endsWith('.org')
    );
  }

  async _flushDns() {
    const platform = os.platform();
    logger.log('Flushing DNS cache...');

    const cmds = {
      darwin: 'killall -HUP mDNSResponder',
      linux: 'systemd-resolve --flush-caches',
    };

    const cmd = cmds[platform];
    if (!cmd) {
      logger.warn('Cannot flush DNS automatically on this OS.');
      logger.info('Please manually flush your DNS cache.');
      return;
    }

    try {
      await execa('sudo', ['sh', '-c', cmd], { stdio: 'inherit' });
      logger.success('DNS cache flushed.');
    } catch (err) {
      logger.error('Failed to flush DNS:', err.message);
      process.exit(1);
    }
  }
}

export default new DomainManager();
