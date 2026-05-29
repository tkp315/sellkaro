import { Router } from 'express';
import { authenticate } from '@modules/shared/auth/helpers/index.js';
import { uploadMiddleware } from '../middleware.js';
import { uploadFiles } from '../controllers/index.js';

const router = Router();

router.post('/', authenticate, uploadMiddleware, uploadFiles);

export default router;
