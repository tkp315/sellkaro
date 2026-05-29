import { Router } from 'express';
import { authenticate } from '../helpers/index.js';
import * as ctrl from '../controllers/index.js';

const router = Router();

// Public
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.post('/google', ctrl.googleAuth);
router.get('/verify-email', ctrl.verifyEmail);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

// Protected
router.get('/profile', authenticate, ctrl.getProfile);
router.patch('/profile', authenticate, ctrl.updateProfile);
router.post('/become-seller', authenticate, ctrl.becomeSeller);

export default router;
