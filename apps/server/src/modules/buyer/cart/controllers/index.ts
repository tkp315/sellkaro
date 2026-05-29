import type { Request, Response } from 'express';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import ApiError from '@utils/apiError.js';
import * as cartService from '../services/index.js';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const cart = await cartService.getCart(req.user.userId);
  return ApiResponse.ok(cart).send(res);
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await cartService.addToCart(req.user.userId, req.params['adId']!);
  return ApiResponse.ok(result).send(res);
});

export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await cartService.removeFromCart(req.user.userId, req.params['adId']!);
  return ApiResponse.ok(result).send(res);
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await cartService.clearCart(req.user.userId);
  return ApiResponse.ok(result).send(res);
});

export const getCartCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const count = await cartService.getCartCount(req.user.userId);
  return ApiResponse.ok({ count }).send(res);
});
