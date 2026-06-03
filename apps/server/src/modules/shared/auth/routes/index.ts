import { Router } from 'express';
import ratelimiter from 'express-rate-limit';
import { authenticate } from '../helpers/index.js';
import * as ctrl from '../controllers/index.js';

const router = Router();

// Stricter rate limit for brute-force targets (10 req / 15 min per IP)
const authLimiter = ratelimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.post('/google', authLimiter, ctrl.googleAuth);
router.get('/verify-email', ctrl.verifyEmail);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, ctrl.resetPassword);
router.post('/verify-otp', authLimiter, ctrl.verifyOtp);
router.post('/resend-otp', authLimiter, ctrl.resendOtp);

// Protected
router.get('/profile', authenticate, ctrl.getProfile);
router.patch('/profile', authenticate, ctrl.updateProfile);
router.post('/become-seller', authenticate, ctrl.becomeSeller);

export default router;
