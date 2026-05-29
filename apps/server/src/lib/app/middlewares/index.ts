import { Application } from 'express';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function init(config: Record<string, any>, appObj: Application) {
  appObj.use(express.json({ limit: '10mb' }));
  appObj.use(express.urlencoded({ extended: true }));

  const items = fs.readdirSync(__dirname);

  const dirs = items.filter(item => {
    return fs.statSync(path.join(__dirname, item)).isDirectory();
  });

  for (const dir of dirs) {
    const module = await import(`./${dir}/index.js`);
    const initFn = module.init ?? module.default;
    if (typeof initFn === 'function') {
      const middlewareConfig = config[dir];
      initFn(middlewareConfig, appObj);
      console.log(`  ✅ middleware/${dir} applied`);
    }
  }
}

export default init
