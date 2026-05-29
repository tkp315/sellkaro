import { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import ApiError from '@utils/apiError.js';
import * as authService from '../services/index.js';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from '../validators/index.js';

function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw ApiError.badRequest(result.error.issues[0]?.message ?? 'Validation error');
  return result.data;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(registerSchema, req.body);
  const result = await authService.register(dto);
  return ApiResponse.created(result, 'Registration successful').send(res);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(loginSchema, req.body);
  const result = await authService.login(dto);
  return ApiResponse.ok(result, 'Login successful').send(res);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(refreshTokenSchema, req.body);
  await authService.logout(dto.refreshToken);
  return ApiResponse.ok(null, 'Logged out successfully').send(res);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(refreshTokenSchema, req.body);
  const result = await authService.refreshTokens(dto.refreshToken);
  return ApiResponse.ok(result, 'Token refreshed').send(res);
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(googleAuthSchema, req.body);
  const result = await authService.googleAuth(dto);
  return ApiResponse.ok(result, 'Google auth successful').send(res);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getProfile(req.user!.userId);
  return ApiResponse.ok(result).send(res);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(updateProfileSchema, req.body);
  const result = await authService.updateProfile(req.user!.userId, dto);
  return ApiResponse.ok(result, 'Profile updated').send(res);
});

export const becomeSeller = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.becomeSeller(req.user!.userId);
  return ApiResponse.ok(result, 'Account upgraded to Seller').send(res);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(forgotPasswordSchema, req.body);
  await authService.forgotPassword(dto);
  return ApiResponse.ok(null, 'If this email exists, a reset link has been sent.').send(res);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(resetPasswordSchema, req.body);
  await authService.resetPassword(dto);
  return ApiResponse.ok(null, 'Password reset successful').send(res);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(verifyEmailSchema, req.query);
  await authService.verifyEmail(dto.token);
  return ApiResponse.ok(null, 'Email verified successfully').send(res);
});
