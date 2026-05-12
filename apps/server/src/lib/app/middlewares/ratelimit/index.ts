import { Application } from 'express';
import { RateLimitConfig } from '@config/app/middlewares/ratelimit/index.js';
import ratelimitter from 'express-rate-limit';
function init(config: RateLimitConfig, appObj: Application) {
  const globalLimiter = {
    windowMs: config.global.windowMs,
    max: config.global.max,
    message: { error: config.global.message },
    standardHeaders: true,
    legacyHeaders: false,
  };
  appObj.use(ratelimitter(globalLimiter));
}

export default  init ;
