import { Application } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AppLib {
  [key: string]: unknown;
}

async function initApps(config: Record<string, unknown>, appObj: Application): Promise<AppLib> {
  const items = fs.readdirSync(__dirname);

  const appDirs = items.filter(item => {
    return fs.statSync(path.join(__dirname, item)).isDirectory();
  });

  const app: AppLib = {};

  for (const dir of appDirs) {
    const module = await import(`./${dir}/index.js`);
    const initFn = module.default ?? module.init;
    if (typeof initFn === 'function') {
      const dirConfig = (config as Record<string, unknown>)[dir];
      app[dir] = await initFn(dirConfig, appObj);
      console.log(`  ✅ app/${dir} initialized`);
    }
  }

  return app;
}

export default initApps;
