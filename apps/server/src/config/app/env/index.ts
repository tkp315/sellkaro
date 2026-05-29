import dotenv from 'dotenv';

function getEnvFile(): string {
  const env = process.env.NODE_ENV;
  switch (env) {
    case 'prod':
      return './.env.prod';
    case 'test':
      return './.env.test';
    case 'dev':
    default:
      return './.env.dev';
  }
}

const envFile = getEnvFile();
dotenv.config({ path: envFile });
console.log(`📄 Loaded ${envFile}`);

export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  // JWT
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  // Google OAuth
  GOOGLE_CLIENT_ID: string;
  // Email (Resend)
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  // App
  CLIENT_URL: string;
  ADMIN_EMAIL: string;
}

async function envConfig(): Promise<EnvConfig> {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  };
}

export default envConfig;
