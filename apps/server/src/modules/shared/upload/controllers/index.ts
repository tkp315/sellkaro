import type { Request, Response } from 'express';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import ApiError from '@utils/apiError.js';
import { uploadFile } from '@lib/services/upload/index.js';

export const uploadFiles = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) throw ApiError.badRequest('No files uploaded');

  const results = await Promise.all(
    files.map((f) => uploadFile(f.buffer, f.mimetype, f.originalname)),
  );

  return ApiResponse.ok(results).send(res);
});
