import { Router } from 'express';
import { requireAdmin } from '../middleware.js';
import * as dashCtrl from '../dashboard/controllers/index.js';
import * as usersCtrl from '../users/controllers/index.js';
import * as listingsCtrl from '../listings/controllers/index.js';
import * as reportsCtrl from '../reports/controllers/index.js';

const router = Router();

router.use(requireAdmin);

router.get('/stats', dashCtrl.getStats);

router.get('/users', usersCtrl.getUsers);
router.patch('/users/:userId/ban', usersCtrl.banUser);
router.patch('/users/:userId/unban', usersCtrl.unbanUser);
router.patch('/users/:userId/role', usersCtrl.changeRole);

router.get('/listings', listingsCtrl.getAds);
router.patch('/listings/:adId/remove', listingsCtrl.removeAd);
router.patch('/listings/:adId/feature', listingsCtrl.featureAd);

router.get('/reports', reportsCtrl.getReports);
router.patch('/reports/:reportId/resolve', reportsCtrl.resolveReport);
router.patch('/reports/:reportId/dismiss', reportsCtrl.dismissReport);

export default router;
