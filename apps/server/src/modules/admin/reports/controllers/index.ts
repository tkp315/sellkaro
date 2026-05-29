import type { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import * as svc from '../services/index.js';

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
    status: z.string().default(''),
  }).parse(req.query);
  return ApiResponse.ok(await svc.getReports({ page, limit, status })).send(res);
});

export const resolveReport = asyncHandler(async (req: Request, res: Response) => {
  const { adminNote } = z.object({ adminNote: z.string().optional() }).parse(req.body);
  return ApiResponse.ok(await svc.resolveReport(req.user!.userId, req.params['reportId']!, adminNote)).send(res);
});

export const dismissReport = asyncHandler(async (req: Request, res: Response) => {
  const { adminNote } = z.object({ adminNote: z.string().optional() }).parse(req.body);
  return ApiResponse.ok(await svc.dismissReport(req.user!.userId, req.params['reportId']!, adminNote)).send(res);
});
