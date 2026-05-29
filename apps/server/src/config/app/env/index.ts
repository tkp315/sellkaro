import dotenv from 'dotenv';

function getEnvFile(): string {
  const env = process.env.NODE_ENV;
  switch (env) {
    case 'prod':
      return './.env.prod';
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
  // Email
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
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
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@olxapp.com',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  };
}

export default envConfig;
