export interface MongoConfig {
  url: string;
  dbName: string;
  maxPoolSize: number;
  minPoolSize: number;
  retryWrites: boolean;
  maximumRetries: number;
  retryTimeInSeconds: number;
  w: string;
}

async function mongoConfig(): Promise<MongoConfig> {
  return {
    url: process.env.MONGO_URL || '',
    dbName: process.env.MONGO_DB_NAME || '',
    maximumRetries: Number(process.env.MONGO_MAX_RETRY || 3),
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 10),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 1),
    retryTimeInSeconds: Number(process.env.MONGO_TIMEOUT || 30),
    retryWrites: true,
    w: 'majority',
  };
}

export default mongoConfig;
