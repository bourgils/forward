import { exec } from 'child_process';
import psTree from 'ps-tree';

function getListeningPort(pid) {
  return new Promise((resolve) => {
    exec(`lsof -Pan -p ${pid} -iTCP -sTCP:LISTEN`, (err, stdout) => {
      if (err || !stdout) return resolve(null);
      const match = stdout.match(/:(\d+)\s\(LISTEN\)/);
      resolve(match ? parseInt(match[1], 10) : null);
    });
  });
}

export async function waitForOpenPort(rootPid, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const poll = () => {
      psTree(rootPid, async (err, children) => {
        if (err) return setTimeout(poll, 300);

        const pidsToCheck = [rootPid, ...children.map((p) => p.PID)];

        for (const pid of pidsToCheck) {
          const port = await getListeningPort(pid);
          if (port) return resolve(port);
        }

        if (Date.now() - start > timeout) {
          return reject(new Error(`Timeout: no open port detected for PID ${rootPid}`));
        }

        setTimeout(poll, 300);
      });
    };

    poll();
  });
}
