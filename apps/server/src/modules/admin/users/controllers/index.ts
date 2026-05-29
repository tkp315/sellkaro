import type { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import * as svc from '../services/index.js';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, role } = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
    search: z.string().default(''),
    role: z.string().default(''),
  }).parse(req.query);
  return ApiResponse.ok(await svc.getUsers({ page, limit, search, role })).send(res);
});

export const banUser = asyncHandler(async (req: Request, res: Response) => {
  const { note } = z.object({ note: z.string().optional() }).parse(req.body);
  return ApiResponse.ok(await svc.banUser(req.user!.userId, req.params['userId']!, note)).send(res);
});

export const unbanUser = asyncHandler(async (req: Request, res: Response) => {
  const { note } = z.object({ note: z.string().optional() }).parse(req.body);
  return ApiResponse.ok(await svc.unbanUser(req.user!.userId, req.params['userId']!, note)).send(res);
});

export const changeRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = z.object({ role: z.enum(['BUYER', 'SELLER', 'ADMIN', 'MODERATOR']) }).parse(req.body);
  return ApiResponse.ok(await svc.changeUserRole(req.user!.userId, req.params['userId']!, role)).send(res);
});
