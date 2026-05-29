import type { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import * as svc from '../services/index.js';

export const getAds = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, status } = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
    search: z.string().default(''),
    status: z.string().default(''),
  }).parse(req.query);
  return ApiResponse.ok(await svc.getAds({ page, limit, search, status })).send(res);
});

export const removeAd = asyncHandler(async (req: Request, res: Response) => {
  const { note } = z.object({ note: z.string().optional() }).parse(req.body);
  return ApiResponse.ok(await svc.removeAd(req.user!.userId, req.params['adId']!, note)).send(res);
});

export const featureAd = asyncHandler(async (req: Request, res: Response) => {
  return ApiResponse.ok(await svc.featureAd(req.user!.userId, req.params['adId']!)).send(res);
});
