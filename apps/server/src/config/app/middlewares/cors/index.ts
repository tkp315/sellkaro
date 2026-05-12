export interface CorsConfig {
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

async function corsConfig(): Promise<CorsConfig> {
  const isProduction = process.env.NODE_ENV === 'production';

  // Parse origins from env (comma separated)
  const originsString = process.env.CORS_ORIGINS || '';
  const origins = isProduction
    ? originsString.split(',').filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:8081']; //Dev: web + expo;

  return {
    origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
    credentials: true,
    maxAge: 86400, // 24 hours preflight cache
  };
}

export default corsConfig;
