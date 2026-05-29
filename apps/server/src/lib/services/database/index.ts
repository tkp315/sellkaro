import { Application } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DatabaseLib {
  [key: string]: unknown;
}

export async function init(
  config: Record<string, unknown>,
  appObj: Application
): Promise<DatabaseLib> {
  const items = fs.readdirSync(__dirname);

  const dbDirs = items.filter(item => {
    return fs.statSync(path.join(__dirname, item)).isDirectory();
  });

  const databases: DatabaseLib = {};

  for (const dir of dbDirs) {
    const module = await import(`./${dir}/index.js`);
    if (module.init) {
      const dbConfig = config[dir];
      if (dbConfig) {
        databases[dir] = await module.init(dbConfig, appObj);
      }
    }
  }

  return databases;
}

export default { init };
