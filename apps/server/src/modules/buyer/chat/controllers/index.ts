import { p } from '@utils/param.js';
import type { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import ApiError from '@utils/apiError.js';
import * as chatService from '../services/index.js';

export const getOrCreateChat = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const chat = await chatService.getOrCreateChat(req.user.userId, p(req, 'adId'));
  return ApiResponse.ok(chat).send(res);
});

export const getChat = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const chat = await chatService.getChat(p(req, 'chatId'), req.user.userId);
  return ApiResponse.ok(chat).send(res);
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { content, mediaUrl, mediaType, awsUrl } = z.object({
    content: z.string().max(1000).default(''),
    mediaUrl: z.string().url().optional(),
    mediaType: z.enum(['image', 'video']).optional(),
    awsUrl: z.string().url().optional(),
  }).parse(req.body);

  if (!content && !mediaUrl) throw ApiError.badRequest('Message content or media required');

  const message = await chatService.sendMessage(
    p(req, 'chatId'),
    req.user.userId,
    content,
    mediaUrl ? { mediaUrl, mediaType, awsUrl } : undefined,
  );
  return ApiResponse.created(message).send(res);
});

export const getMyChats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const chats = await chatService.getMyChats(req.user.userId);
  return ApiResponse.ok(chats).send(res);
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const count = await chatService.getUnreadCount(req.user.userId);
  return ApiResponse.ok({ count }).send(res);
});
