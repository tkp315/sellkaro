import initApps from './app/index.js';
import initHelpers from './helpers/index.js';
import initServices from './services/index.js';
import type { ConfigResult } from '../config/index.js';
import { Application } from 'express';

export interface LibResult {
  services: Record<string, unknown>;
  helper: Record<string, unknown>;
  app: Record<string, unknown>;
}

async function initLibs(config: ConfigResult, appObj: Application): Promise<LibResult> {
  console.log('🔧 Initializing libs...\n');

  console.log('📚 Initializing apps...');
  const app = await initApps(config.app, appObj);
  console.log('📚 All apps initialized!\n');

  console.log('🔧 Initializing helpers...');
  const helper = await initHelpers(config.helpers, appObj);
  console.log('🔧 All helpers initialized!\n');

  console.log('🔌 Initializing services...');
  const services = await initServices.init(config.services, appObj);
  console.log('🔌 All services initialized!\n');

  return { app, helper, services };
}

export default initLibs;
