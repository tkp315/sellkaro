import { Response } from 'express';
import { HTTP_STATUS } from 'globals/constants.js';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiResponseData<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta?: PaginationMeta | Record<string, any>;
}

export class ApiResponse<T = any> implements ApiResponseData<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta?: PaginationMeta | Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    data: T | null = null,
    meta?: PaginationMeta | Record<string, any>
  ) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  // Send response directly
  send(res: Response): Response {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta && { meta: this.meta }),
    });
  }

  // Static factory methods
  static ok<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse(HTTP_STATUS.OK, message, data);
  }

  static created<T>(data: T, message = 'Created successfully'): ApiResponse<T> {
    return new ApiResponse(HTTP_STATUS.CREATED, message, data);
  }

  static noContent(message = 'No content'): ApiResponse<null> {
    return new ApiResponse(HTTP_STATUS.NO_CONTENT, message, null);
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success'
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(total / limit);
    return new ApiResponse(HTTP_STATUS.OK, message, data, {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    });
  }
}

export default ApiResponse;
