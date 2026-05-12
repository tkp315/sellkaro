import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function helpersConfig() {
  const items = fs.readdirSync(__dirname);

  const subDirs = items.filter(item => {
    return fs.statSync(path.join(__dirname, item)).isDirectory();
  });

  const configs = await Promise.all(
    subDirs.map(async dir => {
      const module = await import(`./${dir}/index.js`);
      const config = typeof module.default === 'function' ? await module.default() : module.default;
      return { [dir]: config };
    })
  );

  return Object.assign({}, ...configs);
}

export default helpersConfig;
