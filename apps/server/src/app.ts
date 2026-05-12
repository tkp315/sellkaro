import configLoader from '@config/index.js';
import initLibs from '@lib/index.js';
import express from 'express';
import { setConfig, setLibs } from './globals/index.js';

const app = express();

async function init() {
  const config = await configLoader();
  setConfig(config);

  const libs = await initLibs(config, app);
  setLibs(libs);
}

export { app, init };
