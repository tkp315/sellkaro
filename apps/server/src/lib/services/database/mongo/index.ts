import { MongoConfig } from '@config/services/database/mongo/index.js';
import { getLogger } from '@lib/helpers/logger/index.js'
import { Application } from 'express';
import mongoose from 'mongoose';
export async function init(config: MongoConfig, appObj: Application) {
  const logger = getLogger();

  try {
    await mongoose.connect(config.url, {
      dbName: config.dbName,
      maxPoolSize: config.maxPoolSize,
      minPoolSize: config.minPoolSize,
      retryWrites: config.retryWrites,
      timeoutMS: config.retryTimeInSeconds,
    });
    logger.info('✅ MongoDB connected (Mongoose)', { database: config.dbName });

    mongoose.connection.on('error', err => {
      logger.error('MongoDB connection error', { error: err.message });
    });
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    return mongoose;
  } catch (error) {
    logger.error('MongoDB connection failed', { error: (error as Error).message });
    throw error;
  }
}

export function getConnection(): mongoose.Connection {
  return mongoose.connection;
}
