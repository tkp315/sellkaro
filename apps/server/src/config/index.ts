import './app/env/index.js'; // load dotenv first before anything else
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ConfigResult {
  app: Record<string, unknown>;
  services: Record<string, unknown>;
  helpers: Record<string, unknown>;
}

async function configLoader(): Promise<ConfigResult> {
  console.log('📦 Loading configs...');

  const items = fs.readdirSync(__dirname);

  const configDirs = items.filter(item => {
    const itemPath = path.join(__dirname, item);
    return fs.statSync(itemPath).isDirectory();
  });

  const configs = await Promise.all(
    configDirs.map(async dir => {
      const module = await import(`./${dir}/index.js`);
      const config = typeof module.default === 'function' ? await module.default() : module.default;
      console.log(`  ✅ config/${dir} loaded`);
      return { [dir]: config };
    })
  );

  console.log('📦 All configs loaded!\n');
  return Object.assign({}, ...configs) as ConfigResult;
}

export default configLoader;
