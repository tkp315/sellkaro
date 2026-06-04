export interface RateLimitRule {
  windowMs: number;
  max: number;
  message: string;
}

export interface RateLimitConfig {
  global: RateLimitRule;
  auth: RateLimitRule;
  api: RateLimitRule;
  upload: RateLimitRule;
  ai: RateLimitRule;
  useRedis: boolean;
  skipFailedRequests: boolean;
  skipSuccessfulRequests: boolean;
}

async function rateLimitConfig(): Promise<RateLimitConfig> {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // Global - sabke liye
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isProduction ? 100 : 1000, // Dev mein zyada
      message: 'Too many requests, please try again later',
    },

    // Auth routes - strict
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 10, // Login attempts limited
      message: 'Too many login attempts, please try again after 15 minutes',
    },

    // API routes - normal
    api: {
      windowMs: 15 * 60 * 1000,
      max: 200,
      message: 'API rate limit exceeded',
    },

    // Upload routes - very limited
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20, // 20 uploads per hour
      message: 'Upload limit exceeded, try again later',
    },

    // AI routes - expensive
    ai: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // 50 AI calls per hour
      message: 'AI usage limit exceeded',
    },

    // Redis use karna hai distributed rate limiting ke liye
    useRedis: isProduction,
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
  };
}

export default rateLimitConfig;
