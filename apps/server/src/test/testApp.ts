/**
 * Lightweight test app initializer.
 * Bypasses the dynamic directory-scanning config loader (config/index.ts)
 * which Vite cannot statically analyse. Instead, statically imports every
 * module and wires the Express app manually.
 */
import express from 'express';
import cors from 'cors';
import { setConfig, setLibs } from '../globals/index.js';
import { applyErrorHandlers } from '../lib/app/middlewares/errorHandler/index.js';
import apiRouter from '../routes/index.js';

const testApp = express();
let initialized = false;

export async function initTestApp() {
  if (initialized) return testApp;
  initialized = true;

  // Build config from process.env (already loaded from .env.test by dotenv)
  const e = process.env;
  setConfig({
    app: {
      env: {
        NODE_ENV:              e['NODE_ENV'],
        PORT:                  Number(e['PORT'] ?? 5001),
        JWT_ACCESS_SECRET:     e['JWT_ACCESS_SECRET'] ?? '',
        JWT_REFRESH_SECRET:    e['JWT_REFRESH_SECRET'] ?? '',
        JWT_ACCESS_EXPIRY:     e['JWT_ACCESS_EXPIRY'] ?? '15m',
        JWT_REFRESH_EXPIRY:    e['JWT_REFRESH_EXPIRY'] ?? '7d',
        SMTP_HOST:             e['SMTP_HOST'] ?? '',
        SMTP_PORT:             Number(e['SMTP_PORT'] ?? 587),
        SMTP_USER:             e['SMTP_USER'] ?? '',
        SMTP_PASS:             e['SMTP_PASS'] ?? '',
        EMAIL_FROM:            e['EMAIL_FROM'] ?? '',
        CLIENT_URL:            e['CLIENT_URL'] ?? 'http://localhost:5173',
        ADMIN_EMAIL:           e['ADMIN_EMAIL'] ?? '',
        CLOUDINARY_CLOUD_NAME: e['CLOUDINARY_CLOUD_NAME'] ?? '',
        CLOUDINARY_API_KEY:    e['CLOUDINARY_API_KEY'] ?? '',
        CLOUDINARY_API_SECRET: e['CLOUDINARY_API_SECRET'] ?? '',
        AWS_REGION:            e['AWS_REGION'] ?? 'ap-south-1',
        AWS_ACCESS_KEY_ID:     e['AWS_ACCESS_KEY_ID'] ?? '',
        AWS_SECRET_ACCESS_KEY: e['AWS_SECRET_ACCESS_KEY'] ?? '',
        AWS_S3_BUCKET:         e['AWS_S3_BUCKET'] ?? '',
      },
    },
    services: {},
    helpers: {},
  });

  setLibs({ app: {}, helper: {}, services: {} });

  // Minimal middlewares — skip rate-limit / helmet / compression in tests
  testApp.use(cors({ origin: '*' }));
  testApp.use(express.json({ limit: '10mb' }));
  testApp.use(express.urlencoded({ extended: true }));

  testApp.use('/api/v1', apiRouter);
  applyErrorHandlers(testApp);
}

export default testApp;
