import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['BUYER', 'SELLER']).default('BUYER'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  accessToken: z.string().min(1, 'Google access token is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatar: z.string().url().optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});
