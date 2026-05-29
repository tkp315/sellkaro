import type { Request, Response } from 'express';
import { z } from 'zod';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import ApiError from '@utils/apiError.js';
import * as chatService from '../services/index.js';

export const getOrCreateChat = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const chat = await chatService.getOrCreateChat(req.user.userId, req.params['adId']!);
  return ApiResponse.ok(chat).send(res);
});

export const getChat = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const chat = await chatService.getChat(req.params['chatId']!, req.user.userId);
  return ApiResponse.ok(chat).send(res);
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { content } = z.object({ content: z.string().min(1).max(1000) }).parse(req.body);
  const message = await chatService.sendMessage(req.params['chatId']!, req.user.userId, content);
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
