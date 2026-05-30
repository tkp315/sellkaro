import { ConfigResult } from '@config/index.js';

// Fix Express 5: params always string (not string | string[])
declare module 'express-serve-static-core' {
  interface ParamsDictionary {
    [key: string]: string;
  }
}

declare global {
  namespace Express {
    interface Application {
      config: ConfigResult;
    }
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};
