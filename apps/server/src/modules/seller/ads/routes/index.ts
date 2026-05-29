import { Router } from 'express';
import { authenticate } from '@modules/shared/auth/helpers/index.js';
import * as ctrl from '../controllers/index.js';

const router = Router();

router.use(authenticate);

router.post('/', ctrl.createAd);
router.get('/', ctrl.getMyAds);
router.get('/:id', ctrl.getMyAdById);
router.patch('/:id', ctrl.updateAd);
router.delete('/:id', ctrl.deleteAd);
router.patch('/:id/status', ctrl.changeAdStatus);

export default router;
