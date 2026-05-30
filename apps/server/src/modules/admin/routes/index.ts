import { Router } from 'express';
import { requireAdmin } from '../middleware.js';
import * as dashCtrl from '../dashboard/controllers/index.js';
import * as usersCtrl from '../users/controllers/index.js';
import * as listingsCtrl from '../listings/controllers/index.js';
import * as reportsCtrl from '../reports/controllers/index.js';
import * as catCtrl from '../categories/controllers/index.js';

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
router.post('/reports', reportsCtrl.createReport);
router.patch('/reports/:reportId/resolve', reportsCtrl.resolveReport);
router.patch('/reports/:reportId/dismiss', reportsCtrl.dismissReport);

// Categories
router.get('/categories', catCtrl.getCategories);
router.post('/categories', catCtrl.createCategory);
router.patch('/categories/:id', catCtrl.updateCategory);
router.delete('/categories/:id', catCtrl.deleteCategory);

// Subcategories
router.post('/categories/:categoryId/subcategories', catCtrl.createSubcategory);
router.patch('/categories/:categoryId/subcategories/:subId', catCtrl.updateSubcategory);
router.delete('/categories/:categoryId/subcategories/:subId', catCtrl.deleteSubcategory);

export default router;
