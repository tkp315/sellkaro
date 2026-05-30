import { Router } from 'express';
import { authenticate } from '@modules/shared/auth/helpers/index.js';
import * as ctrl from '../controllers/index.js';

const router = Router();

router.post('/', authenticate, ctrl.createOrUpdateReview);
router.get('/seller/:sellerId', ctrl.getSellerReviews);
router.get('/my/:sellerId', authenticate, ctrl.getMyReview);
router.delete('/seller/:sellerId', authenticate, ctrl.deleteReview);

export default router;
