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
}

async function envConfig(): Promise<EnvConfig> {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
  };
}

export default envConfig;
