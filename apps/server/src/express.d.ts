import { ConfigResult } from '@config/index.js';

interface AuthUser {
  id: string;
  // email?: string;
  // name?: string;
}

declare global {
  namespace Express {
    interface Application {
      config: ConfigResult;
    }
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
