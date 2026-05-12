// import initServices from './services/index.js';
import initHelpers from './helpers/index.js';
import type { ConfigResult } from '../config/index.js';
import { Application } from 'express';

import type { ServicesType, HelperType } from '../globals/types.js';
import initApps from './app/index.js';

export interface LibResult {
//   services: ServicesType;
  helper: HelperType;
}

async function initLibs(config: ConfigResult, appObj: Application): Promise<LibResult> {
  console.log('🔧 Initializing libs...\n');
  console.log('📚 Initializing apps...');
  const apps = await initApps(config.app, appObj);
  console.log('📚 Initializing helpers...');
  const helper = await initHelpers(config.helpers, appObj);
  console.log('📚 All helpers initialized!\n');

  // Initialize services (database, redis, s3, etc.)
  console.log('🔌 Initializing services...');
//   const services = await initServices(config.services, appObj);
  console.log('🔌 All services initialized!\n');

//   return { services: services as unknown as ServicesType, helper };
return {helper};
}

export default initLibs;
