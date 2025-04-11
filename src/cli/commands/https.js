import { waitForOpenPort } from '../../lib/port-watcher.js';
import { setupHosts, removeHosts } from '../../lib/hosts.js';
import { ensureCerts } from '../../lib/certs.js';
import { createProxyServer } from '../../lib/proxy.js';
import { Command } from 'commander';
import { runAction } from './run.js';
import ora from 'ora';
import os from 'os';
import { execa } from 'execa';
import logger from '../../core/logger.js';
import { getProjectId, getProjectName } from '../../core/env.js';
import chalk from 'chalk';
import open from 'open';

function isLikelyPublicDomain(domain) {
  return (
    domain.endsWith('.com') ||
    domain.endsWith('.io') ||
    domain.endsWith('.net') ||
    domain.endsWith('.fr') ||
    domain.endsWith('.ai') ||
    domain.endsWith('.org')
  );
}

async function flushDns() {
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

const defaultDomain = `${getProjectId()}.${getProjectName()}.dev`;

export const httpsCommand = new Command('https')
  .alias('h')
  .description('Run a package script securely with HTTPS proxy')
  .option('--domain <domain>', 'Local domain to map', defaultDomain)
  .option('--script <script>', 'npm/yarn script to run')
  .action(async ({ domain = defaultDomain, script }) => {
    logger.log(`Launching secure dev server...`);

    if (isLikelyPublicDomain(domain)) {
      logger.warn(
        ` Warning: "${domain}" looks like a real public domain.\n` +
          `   To avoid conflicts, use something like \`fwd.local\` or \`fwd.test\``
      );
    }

    let proxy;

    const cleanup = async () => {
      logger.raw('\n');
      logger.log('Cleaning up HTTPS proxy...');
      removeHosts(domain);
      if (proxy) proxy.close();
    };

    process.once('SIGINT', cleanup);
    process.once('SIGTERM', cleanup);

    try {
      await runAction(script, [], async (child) => {
        const spinner = ora(`Waiting for local server to expose a port...`).start();

        try {
          const detectedPort = await waitForOpenPort(child.pid);
          spinner.succeed(`Detected local server on port ${detectedPort}`);

          const needFlushDns = await setupHosts(domain);
          if (needFlushDns) await flushDns();

          const { cert, key } = await ensureCerts(domain);
          proxy = await createProxyServer({ domain, targetPort: detectedPort, cert, key });

          logger.success(`Secure dev server is ready at: ${chalk.underline(`https://${domain}`)}`);
          await open(`https://${domain}`);
        } catch (err) {
          spinner.fail(`Failed: ${err.message}`);
          cleanup();
        }
      });
    } catch (err) {
      logger.error(`Failed to run script: ${err.message}`);
      cleanup();
      process.exit(1);
    }
  });
