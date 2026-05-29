import { Router } from 'express';
import { authenticate } from '@modules/shared/auth/helpers/index.js';
import * as ctrl from '../controllers/index.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getWishlist);
router.get('/ids', ctrl.getWishlistIds);
router.post('/:adId', ctrl.toggleWishlist);

export default router;
