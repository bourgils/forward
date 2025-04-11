import { execa } from 'execa';
import fs from 'fs';
import logger from '../core/logger.js';

const HOSTS_PATH = '/etc/hosts';

export async function setupHosts(domain) {
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
    return true;
  } catch (err) {
    logger.error('Failed to update /etc/hosts:', err.message);
    logger.warn('Please update /etc/hosts manually.');
    return false;
  }
}

export async function removeHosts(domain) {
  try {
    logger.log(`Updating /etc/hosts...`);
    const content = fs.readFileSync(HOSTS_PATH, 'utf8');
    const regex = new RegExp(`.*\\s${domain}\\s*\\n?`, 'g');
    const newContent = content.replace(regex, '');
    fs.writeFileSync(HOSTS_PATH, newContent);
    logger.success(`Removed ${domain} from /etc/hosts`);
    return true;
  } catch (err) {
    logger.warn('Could not clean /etc/hosts. Try manually:', err.message);
    return false;
  }
}
