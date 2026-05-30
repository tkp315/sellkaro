export interface CorsConfig {
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

async function corsConfig(): Promise<CorsConfig> {
  const env = process.env.NODE_ENV;
  const isProduction = env === 'production' || env === 'prod';

  // Parse origins from env (comma separated). Prod uses CORS_ORIGINS; dev allows localhost.
  const originsString = process.env.CORS_ORIGINS || '';
  const envOrigins = originsString.split(',').map((o) => o.trim()).filter(Boolean);
  const origins = isProduction
    ? envOrigins
    : ['http://localhost:5173', 'http://localhost:8081']; //Dev: web + expo;

  return {
    origins: origins.length ? origins : ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
    credentials: true,
    maxAge: 86400, // 24 hours preflight cache
  };
}

export default corsConfig;
