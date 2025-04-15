import fs from 'fs';
import path from 'path';

export const getFolderSize = (folderPath) => {
  let total = 0;

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) walk(fullPath);
      else total += stat.size;
    }
  }

  walk(folderPath);
  return total;
};
