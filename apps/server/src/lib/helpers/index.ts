import { Application } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface HelperLib {
  [key: string]: unknown;
}

async function initHelpers(
  config: Record<string, unknown>,
  appObj: Application
): Promise<HelperLib> {
  const items = fs.readdirSync(__dirname);

  const helperDirs = items.filter(item => {
    return fs.statSync(path.join(__dirname, item)).isDirectory();
  });

  const helpers: HelperLib = {};

  for (const dir of helperDirs) {
    const module = await import(`./${dir}/index.js`);
    const initFn = module.default ?? module.init;
    if (typeof initFn === 'function') {
      const helperConfig = (config as Record<string, unknown>)[dir];
      helpers[dir] = await initFn(helperConfig, appObj);
      console.log(`  ✅ helper/${dir} initialized`);
    }
  }

  return helpers;
}

export default initHelpers;
