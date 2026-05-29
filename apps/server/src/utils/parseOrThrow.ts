import { z } from 'zod';
import ApiError from './apiError.js';

export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw ApiError.badRequest(result.error.issues[0]?.message ?? 'Validation error');
  return result.data;
}
