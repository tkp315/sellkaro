import { p } from '@utils/param.js';
import type { Request, Response } from 'express';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import ApiError from '@utils/apiError.js';
import * as wishlistService from '../services/index.js';

export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await wishlistService.toggleWishlist(req.user.userId, p(req, 'adId'));
  return ApiResponse.ok(result).send(res);
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const items = await wishlistService.getWishlist(req.user.userId);
  return ApiResponse.ok(items).send(res);
});

export const getWishlistIds = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const ids = await wishlistService.getWishlistIds(req.user.userId);
  return ApiResponse.ok(ids).send(res);
});
