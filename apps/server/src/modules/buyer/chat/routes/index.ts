import { Router } from 'express';
import { authenticate } from '@modules/shared/auth/helpers/index.js';
import * as ctrl from '../controllers/index.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getMyChats);
router.get('/unread', ctrl.getUnreadCount);
router.post('/ad/:adId', ctrl.getOrCreateChat);
router.get('/:chatId', ctrl.getChat);
router.post('/:chatId/messages', ctrl.sendMessage);

export default router;
