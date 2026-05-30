import { p } from '@utils/param.js';
import type { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import * as svc from '../services/index.js';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = z.object({ page: z.coerce.number().default(1), limit: z.coerce.number().default(20) }).parse(req.query);
  return ApiResponse.ok(await svc.getNotifications(req.user!.userId, page, limit)).send(res);
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  return ApiResponse.ok({ count: await svc.getUnreadCount(req.user!.userId) }).send(res);
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await svc.markRead(req.user!.userId, p(req, 'id'));
  return ApiResponse.ok({ read: true }).send(res);
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await svc.markAllRead(req.user!.userId);
  return ApiResponse.ok({ done: true }).send(res);
});
