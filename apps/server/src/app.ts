import configLoader from '@config/index.js';
import initLibs from '@lib/index.js';
import express from 'express';
import { setConfig, setLibs } from './globals/index.js';
import { applyErrorHandlers } from '@lib/app/middlewares/errorHandler/index.js';
import apiRouter from './routes/index.js';

const app = express();

// Behind Nginx (reverse proxy) — trust the first proxy so req.ip and
// express-rate-limit read the real client IP from X-Forwarded-For.
app.set('trust proxy', 1);

let initialized = false;

async function init() {
  if (initialized) return;
  initialized = true;

  const config = await configLoader();
  setConfig(config);

  const libs = await initLibs(config, app);
  setLibs(libs);

  app.use('/api/v1', apiRouter);
  applyErrorHandlers(app);
}

export { app, init };
