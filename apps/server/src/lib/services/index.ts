import { Application } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ServicesLib {
  [key: string]: unknown;
}

export async function init(
  config: Record<string, unknown>,
  appObj: Application
): Promise<ServicesLib> {
  const items = fs.readdirSync(__dirname);

  const subDirs = items.filter(item => {
    return fs.statSync(path.join(__dirname, item)).isDirectory();
  });

  const services: ServicesLib = {};

  for (const dir of subDirs) {
    const module = await import(`./${dir}/index.js`);
    const initFn = module.default?.init ?? module.init ?? module.default;
    if (typeof initFn === 'function') {
      const serviceConfig = (config as Record<string, unknown>)[dir];
      services[dir] = await initFn(serviceConfig, appObj);
      console.log(`  ✅ service/${dir} initialized`);
    }
  }

  return services;
}

export default { init };
