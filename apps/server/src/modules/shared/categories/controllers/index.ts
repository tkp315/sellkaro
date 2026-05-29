import type { Request, Response } from 'express';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import * as categoriesService from '../services/index.js';

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoriesService.getCategories();
  return ApiResponse.ok(categories).send(res);
});
