import { ConfigResult } from '@config/index.js';
import { LibResult } from '@lib/index.js';

// ============================================
// REDIS SERVICE TYPES
// ============================================
type RedisClientType = 'cache' | 'queue' | 'session' | 'rateLimit';

export interface RedisServiceType {
  get: (key: string, clientType?: RedisClientType) => Promise<string | null>;
  set: (key: string, value: string, ttlSeconds?: number, clientType?: RedisClientType) => Promise<'OK'>;
  del: (key: string, clientType?: RedisClientType) => Promise<number>;
  exists: (key: string, clientType?: RedisClientType) => Promise<number>;
  expire: (key: string, seconds: number, clientType?: RedisClientType) => Promise<number>;
  ttl: (key: string, clientType?: RedisClientType) => Promise<number>;
  getJson: <T>(key: string, clientType?: RedisClientType) => Promise<T | null>;
  setJson: <T>(key: string, value: T, ttlSeconds?: number, clientType?: RedisClientType) => Promise<'OK'>;
  hget: (key: string, field: string, clientType?: RedisClientType) => Promise<string | null>;
  hset: (key: string, field: string, value: string, clientType?: RedisClientType) => Promise<number>;
  hgetall: (key: string, clientType?: RedisClientType) => Promise<Record<string, string>>;
  hdel: (key: string, field: string, clientType?: RedisClientType) => Promise<number>;
  incr: (key: string, clientType?: RedisClientType) => Promise<number>;
  decr: (key: string, clientType?: RedisClientType) => Promise<number>;
  keys: (pattern: string, clientType?: RedisClientType) => Promise<string[]>;
  ping: (clientType?: RedisClientType) => Promise<string>;
  disconnectAll: () => Promise<void>;
}

// ============================================
// HELPER TYPES
// ============================================
export interface HelperType {
  logger?: unknown;
  jwt?: unknown;
  multer?: unknown;
}

// ============================================
// MAIN GLOBAL TYPE
// ============================================
export interface AppGlobal {
  config: ConfigResult;
  libs: LibResult;
}
