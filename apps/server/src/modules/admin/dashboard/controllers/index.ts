import type { Request, Response } from 'express';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import * as svc from '../services/index.js';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await svc.getStats();
  return ApiResponse.ok(stats).send(res);
});
