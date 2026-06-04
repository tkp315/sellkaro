import { CorsConfig } from "@config/app/middlewares/cors/index.js";
import { Application } from "express";
import cors from 'cors';

// Allowed origins are fully driven by the CORS_ORIGINS env var (comma-separated),
// plus any Vercel deployment and localhost for convenience.
function isAllowedOrigin(origin: string, configured: string[]): boolean {
  if (configured.includes(origin)) return true;
  // Allow any Vercel deployment (production + preview URLs)
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  // Allow localhost (any port) for dev
  if (/^http:\/\/localhost(:\d+)?$/i.test(origin)) return true;
  return false;
}

function init(config: CorsConfig, appObj: Application) {
  appObj.use(cors({
    allowedHeaders: config.allowedHeaders,
    credentials: config.credentials,
    methods: config.methods,
    origin: (origin, callback) => {
      // No origin = curl, server-to-server, mobile apps → allow
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin, config.origins)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    exposedHeaders: config.exposedHeaders,
    maxAge: config.maxAge,
  }));
}

export default init;
