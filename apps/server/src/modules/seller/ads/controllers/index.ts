import { p } from '@utils/param.js';
import type { Request, Response } from 'express';
import asyncHandler from '@utils/asyncHandler.js';
import ApiResponse from '@utils/apiResponse.js';
import { parseOrThrow } from '@utils/parseOrThrow.js';
import * as adsService from '../services/index.js';
import { createAdSchema, updateAdSchema, changeStatusSchema } from '../validators/index.js';

export const createAd = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(createAdSchema, req.body);
  const ad = await adsService.createAd(req.user!.userId, dto);
  return ApiResponse.created(ad).send(res);
});

export const getMyAds = asyncHandler(async (req: Request, res: Response) => {
  const ads = await adsService.getMyAds(req.user!.userId);
  return ApiResponse.ok(ads).send(res);
});

export const getMyAdById = asyncHandler(async (req: Request, res: Response) => {
  const ad = await adsService.getMyAdById(req.user!.userId, p(req, 'id'));
  return ApiResponse.ok(ad).send(res);
});

export const updateAd = asyncHandler(async (req: Request, res: Response) => {
  const dto = parseOrThrow(updateAdSchema, req.body);
  const ad = await adsService.updateAd(req.user!.userId, p(req, 'id'), dto);
  return ApiResponse.ok(ad).send(res);
});

export const deleteAd = asyncHandler(async (req: Request, res: Response) => {
  await adsService.deleteAd(req.user!.userId, p(req, 'id'));
  return ApiResponse.ok({ message: 'Ad deleted' }).send(res);
});

export const changeAdStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = parseOrThrow(changeStatusSchema, req.body);
  const ad = await adsService.changeAdStatus(req.user!.userId, p(req, 'id'), status);
  return ApiResponse.ok(ad).send(res);
});

export const getSellerPublicProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = await adsService.getSellerPublicProfile(p(req, 'userId'));
  return ApiResponse.ok(data).send(res);
});
