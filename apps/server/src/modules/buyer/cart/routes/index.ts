import { Router } from 'express';
import { authenticate } from '@modules/shared/auth/helpers/index.js';
import * as ctrl from '../controllers/index.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getCart);
router.get('/count', ctrl.getCartCount);
router.post('/:adId', ctrl.addToCart);
router.delete('/clear', ctrl.clearCart);
router.delete('/:adId', ctrl.removeFromCart);

export default router;
