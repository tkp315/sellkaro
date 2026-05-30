import type { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import * as feedService from '../services/index.js';

const feedFiltersSchema = z.object({
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  city: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const result = feedFiltersSchema.safeParse(req.query);
  const filters = result.success ? result.data : {};
  const data = await feedService.getFeed(filters);
  return ApiResponse.ok(data).send(res);
});

export const getAdDetail = asyncHandler(async (req: Request, res: Response) => {
  const ad = await feedService.getAdDetail(req.params['id']!);
  return ApiResponse.ok(ad).send(res);
});

export const revealPhone = asyncHandler(async (req: Request, res: Response) => {
  const result = await feedService.revealPhone(req.params['id']!, req.user!.userId);
  return ApiResponse.ok(result).send(res);
});

export const reportAd = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = z.object({ reason: z.string().min(5, 'Please provide a reason') }).parse(req.body);
  await feedService.reportAd(req.params['id']!, req.user!.userId, reason);
  return ApiResponse.ok(null, 'Report submitted. Our team will review it.').send(res);
});
