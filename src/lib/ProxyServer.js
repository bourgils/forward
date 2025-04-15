import logger from './Logger.js';
import serviceFactory from '../services/index.js';
import ora from 'ora';
import chalk from 'chalk';
import open from 'open';
import { waitForOpenPort } from '../utils/port-watcher.js';
import domainManager from './DomainManager.js';
import certManager from './CertManager.js';
import httpProxy from 'http-proxy';
import https from 'https';
import fs from 'fs';

class ProxyServer {
  constructor() {
    this.proxy = null;
    this.domain = null;
    this.targetPort = null;
  }

  setup(domain, targetPort) {
    const defaultDomain = `${serviceFactory.envService.getProjectId()}.${serviceFactory.envService.getProjectName()}.dev`;
    this.domain = domain || defaultDomain;
    this.targetPort = targetPort;

    logger.info(`Launching with HTTPS`);

    if (domainManager.isLikelyPublicDomain(this.domain)) {
      const localDomain = this.domain.split('.').slice(0, -1).join('.');
      logger.warn(
        ` Warning: "${this.domain}" looks like a real public domain.\n` +
          `   To avoid conflicts, use something like \`${localDomain}.local\` or \`${localDomain}.test\``
      );
    }

    return this._attachProxy.bind(this);
  }

  async _attachProxy(child) {
    const spinner = ora(`Waiting for local server to expose a port…`).start();

    try {
      let detectedPort = await waitForOpenPort(child.pid);

      if (this.targetPort) {
        logger.log(`Using target port ${this.targetPort} for the proxy…`);
        detectedPort = this.targetPort;
        spinner.stop();
      } else {
        spinner.succeed(`Detected local server on port ${detectedPort}`);
      }

      await domainManager.writeToHosts(this.domain);

      const { cert, key } = await certManager.ensureCerts(this.domain);

      this.proxy = await this._createProxyServer({
        domain: this.domain,
        targetPort: detectedPort,
        cert,
        key,
      });

      await open(`https://${this.domain}`);
    } catch (err) {
      spinner.fail(`Failed: ${err.message}`);
      this.cleanup();
    }
  }

  async _createProxyServer({ domain, targetPort, cert, key }) {
    try {
      const proxyPort = 443;
      logger.log(`Creating proxy server on port ${proxyPort} proxying to ${targetPort}…`);
      const proxy = httpProxy.createProxyServer({
        target: `http://localhost:${targetPort}`,
        targetPort: targetPort || 3000,
        domain,
        changeOrigin: true,
        ws: true,
        secure: false,
        proxyTimeout: 120000,
        timeout: 120000,
        followRedirects: true,
        xfwd: true,
        rejectUnauthorized: false,
        cert,
        key,
      });

      proxy.on('error', (err, req, res) => {
        logger.error('Proxy error:', err.message);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
        res.end('Proxy error.');
      });

      proxy.on('proxyReqWs', (proxyReq, req, socket, options) => {
        logger.info('WebSocket connection established');
        logger.info(`WebSocket target: ${options.target}`);
      });

      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('Connection', 'keep-alive');
        proxyReq.setHeader('Upgrade', 'websocket');
        proxyReq.setHeader('Sec-WebSocket-Version', '13');
      });

      const server = https.createServer(
        {
          key: fs.readFileSync(key),
          cert: fs.readFileSync(cert),
          rejectUnauthorized: false,
        },
        (req, res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
          res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
          proxy.web(req, res);
        }
      );

      server.on('upgrade', (req, socket, head) => {
        logger.info('Upgrade request received');
        proxy.ws(req, socket, head);
      });

      server.listen(proxyPort, () => {
        logger.success(
          `Secure dev server is ready at ${chalk.cyan(chalk.underline(`https://${this.domain}`))}`
        );
      });

      return server;
    } catch (err) {
      logger.error(`Server proxy fell: ${err.message}`);
      process.exit(1);
    }
  }

  async cleanup() {
    if (this.proxy) {
      logger.log('Closing HTTPS proxy…');
      this.proxy.close();
      logger.success('Proxy closed');
    }
    await domainManager.removeFromHosts(this.domain);
  }
}

export default new ProxyServer();
