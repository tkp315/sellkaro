import { ConfigResult } from '@config/index.js';
import { LibResult } from '@lib/index.js';
import type { AppGlobal } from './types.js';

const SK: AppGlobal = {
  config: {} as ConfigResult,
  libs: {} as LibResult,
};

export function setConfig(config: ConfigResult) {
  SK.config = config;
}

export function setLibs(libs: LibResult) {
  SK.libs = libs;
}

export default SK;
