import { p } from '@utils/param.js';
import { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import ApiError from '@utils/apiError.js';
import * as svc from '../services/index.js';

function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw ApiError.badRequest(result.error.issues[0]?.message ?? 'Validation error');
  return result.data;
}

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
  icon: z.string().optional(),
  order: z.number().int().optional(),
});

const subcategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
  icon: z.string().optional(),
  order: z.number().int().optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const data = await svc.getCategories();
  return ApiResponse.ok(data).send(res);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(categorySchema, req.body);
  const data = await svc.createCategory(dto);
  return ApiResponse.created(data, 'Category created').send(res);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(updateSchema, req.body);
  const data = await svc.updateCategory(p(req, 'id'), dto);
  return ApiResponse.ok(data, 'Category updated').send(res);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteCategory(p(req, 'id'));
  return ApiResponse.ok(null, 'Category deleted').send(res);
});

export const createSubcategory = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(subcategorySchema, req.body);
  const data = await svc.createSubcategory(p(req, 'categoryId'), dto);
  return ApiResponse.created(data, 'Subcategory created').send(res);
});

export const updateSubcategory = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(updateSchema, req.body);
  const data = await svc.updateSubcategory(p(req, 'subId'), dto);
  return ApiResponse.ok(data, 'Subcategory updated').send(res);
});

export const deleteSubcategory = asyncHandler(async (req: Request, res: Response) => {
  await svc.deleteSubcategory(p(req, 'subId'));
  return ApiResponse.ok(null, 'Subcategory deleted').send(res);
});
