import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '@modules/shared/auth/helpers/index.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  authenticate(req, res, () => {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'MODERATOR') {
      res.status(403).json({ success: false, error: 'Admin access required' });
      return;
    }
    next();
  });
}
