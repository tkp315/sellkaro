import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
let logger: winston.Logger;

import { LoggerConfig } from '@config/helpers/logger/index.js';
import { Application } from 'express';
export async function init(config: LoggerConfig, appObj: Application): Promise<winston.Logger> {
  const { level, format, console: consoleConfig, file, error } = config;

  // Formats
  const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );

  const prettyFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} [${level}]: ${message} ${metaStr}`;
    })
  );

  // Transports
  const transports: winston.transport[] = [];

  // Console transport
  if (consoleConfig.enabled) {
    transports.push(
      new winston.transports.Console({
        format: format === 'pretty' ? prettyFormat : jsonFormat,
      })
    );
  }

  // File transport (production)
  if (file.enabled) {
    transports.push(
      new DailyRotateFile({
        dirname: file.dirname,
        filename: file.filename,
        datePattern: 'YYYY-MM-DD',
        maxSize: file.maxSize,
        maxFiles: file.maxFiles,
        format: jsonFormat,
      })
    );

    transports.push(
      new DailyRotateFile({
        dirname: file.dirname,
        filename: error.filename,
        datePattern: 'YYYY-MM-DD',
        maxSize: file.maxSize,
        maxFiles: file.maxFiles,
        level: 'error',
        format: jsonFormat,
      })
    );
  }

  // Create logger
  logger = winston.createLogger({
    level,
    transports,
  });

  logger.info('Logger initialized', { level, format });

  return logger;
}

// Get logger instance
export function getLogger(): winston.Logger {
  if (!logger) {
    throw new Error('Logger not initialized. Call initLogger first.');
  }
  return logger;
}

export default { init, getLogger };
