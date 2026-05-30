import { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import ApiError from '@utils/apiError.js';
import * as svc from '../services/index.js';

const reviewSchema = z.object({
  sellerId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  adId: z.string().optional(),
});

export const createOrUpdateReview = asyncHandler(async (req: Request, res: Response) => {
  const dto = reviewSchema.parse(req.body);
  const review = await svc.createOrUpdateReview(
    req.user!.userId,
    dto.sellerId,
    dto.rating,
    dto.comment,
    dto.adId,
  );
  return ApiResponse.created(review, 'Review submitted').send(res);
});

export const getSellerReviews = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getSellerReviews(req.params['sellerId']!);
  return ApiResponse.ok(data).send(res);
});

export const getMyReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await svc.getMyReviewForSeller(
    req.user!.userId,
    req.params['sellerId']!,
  );
  return ApiResponse.ok(review).send(res);
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteReview(req.user!.userId, req.params['sellerId']!);
  return ApiResponse.ok(null, 'Review deleted').send(res);
});
