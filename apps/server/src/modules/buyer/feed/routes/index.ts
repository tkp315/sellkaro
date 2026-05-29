import { Router } from 'express';
import { authenticate } from '@modules/shared/auth/helpers/index.js';
import * as ctrl from '../controllers/index.js';

const router = Router();

router.get('/', ctrl.getFeed);
router.get('/:id', ctrl.getAdDetail);
router.post('/:id/reveal-phone', authenticate, ctrl.revealPhone);

export default router;
