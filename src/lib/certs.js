import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import forge from 'node-forge';
import { execa } from 'execa';
import logger from '../core/logger.js';
import { getEnvPaths } from '../core/env.js';

const CERTS_DIR = path.join(os.homedir(), '.fwd', 'certs');
await fs.ensureDir(CERTS_DIR);

export async function ensureCerts(domain) {
  const { id } = await getEnvPaths();
  const certPath = path.join(CERTS_DIR, `${id}-${domain}.pem`);
  const keyPath = path.join(CERTS_DIR, `${id}-${domain}-key.pem`);

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return { cert: certPath, key: keyPath };
  }

  logger.info(`Generating self-signed cert for ${domain}...`);

  const pki = forge.pki;
  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();

  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [
    { name: 'commonName', value: domain },
    { name: 'organizationName', value: 'fwd Dev Proxy' },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
    {
      name: 'subjectAltName',
      altNames: [{ type: 2, value: domain }],
    },
  ]);

  cert.sign(keys.privateKey);

  const pemCert = pki.certificateToPem(cert);
  const pemKey = pki.privateKeyToPem(keys.privateKey);

  await fs.writeFile(certPath, pemCert);
  await fs.writeFile(keyPath, pemKey);

  logger.success(`Self-signed cert for ${domain} generated`);

  await addCertToTrustStore(domain, 'system');

  return { cert: certPath, key: keyPath };
}

function getKeychain(scope = 'system') {
  if (scope === 'login') {
    return `${os.homedir()}/Library/Keychains/login.keychain-db`;
  }

  // default = system
  return '/Library/Keychains/System.keychain';
}

export async function addCertToTrustStore(domain, scope = 'system') {
  const { id } = await getEnvPaths();

  const certPath = path.join(CERTS_DIR, `${id}-${domain}.pem`);
  const platform = os.platform();
  const keychain = getKeychain(scope);

  if (!fs.existsSync(certPath)) {
    logger.error(`Cert not found at ${certPath}`);
    return process.exit(1);
  }

  if (platform === 'darwin') {
    logger.log(`Adding ${domain} cert to ${scope} keychain...`);
    try {
      await execa(
        'security',
        ['add-trusted-cert', '-d', '-r', 'trustRoot', '-k', keychain, certPath],
        { stdio: 'inherit' }
      );

      logger.success(`Trusted cert added for ${domain}`);
    } catch (err) {
      logger.error(`Failed to add cert:`, err.message);
    }
  } else if (platform === 'linux') {
    const dest = `/usr/local/share/ca-certificates/${id}-${domain}.crt`;
    logger.log(`Adding ${domain} cert to Linux CA store...`);
    await execa('sudo', ['cp', certPath, dest], { stdio: 'inherit' });
    await execa('sudo', ['update-ca-certificates'], { stdio: 'inherit' });
    logger.success(`Trusted cert added for ${domain}`);
  } else {
    logger.error(`Unsupported OS: ${platform}`);
    return process.exit(1);
  }
}
