
export interface LoggerConfig {
  level: string;
  format: 'pretty' | 'json';
  console: { enabled: boolean };
  file: {
    enabled: boolean;
    dirname: string;
    filename: string;
    maxSize: string;
    maxFiles: string;
  };
  error: { filename: string };
}

const loggerConfig = (): LoggerConfig => ({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: process.env.NODE_ENV === 'development' ? 'pretty' : 'json',
  console: { enabled: true },
  file: {
    enabled: process.env.NODE_ENV === 'production',
    dirname: 'logs',
    filename: 'app-%DATE%.log',
    maxSize: '20m',
    maxFiles: '14d',
  },
  error: { filename: 'error-%DATE%.log' },
});

export default loggerConfig;
