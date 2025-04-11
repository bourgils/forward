import https from 'https';
import fs from 'fs';
import httpProxy from 'http-proxy';
import logger from '../core/logger.js';

export async function createProxyServer({ domain, targetPort, cert, key }) {
  const proxy = httpProxy.createProxyServer({
    target: `http://localhost:${targetPort}`,
    targetPort: 3000,
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

  server.listen(443);

  return server;
}
