import { Router } from 'express';
import authRouter from '@modules/shared/auth/routes/index.js';
import categoriesRouter from '@modules/shared/categories/routes/index.js';
import feedRouter from '@modules/buyer/feed/routes/index.js';
import wishlistRouter from '@modules/buyer/wishlist/routes/index.js';
import cartRouter from '@modules/buyer/cart/routes/index.js';
import chatRouter from '@modules/buyer/chat/routes/index.js';
import sellerAdsRouter from '@modules/seller/ads/routes/index.js';
import adminRouter from '@modules/admin/routes/index.js';
import notificationRouter from '@modules/shared/notification/routes/index.js';
import uploadRouter from '@modules/shared/upload/routes/index.js';
import { getSellerPublicProfile } from '@modules/seller/ads/controllers/index.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/categories', categoriesRouter);
router.use('/ads', feedRouter);
router.use('/buyer/wishlist', wishlistRouter);
router.use('/buyer/cart', cartRouter);
router.use('/buyer/chats', chatRouter);
router.use('/seller/ads', sellerAdsRouter);
router.get('/users/:userId/profile', getSellerPublicProfile);
router.use('/admin', adminRouter);
router.use('/notifications', notificationRouter);
router.use('/upload', uploadRouter);

export default router;
