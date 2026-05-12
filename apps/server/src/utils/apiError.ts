import { HTTP_STATUS } from 'globals/constants.js';

export interface ErrorDetails {
  field?: string;
  code?: string;
  cause?: any;
}

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: ErrorDetails[];

  constructor(
    statusCode: number,
    message: string,
    errors?: ErrorDetails[],
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Static factory methods
  static badRequest(message = 'Bad request', errors?: ErrorDetails[]): ApiError {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message = 'Conflict', errors?: ErrorDetails[]): ApiError {
    return new ApiError(HTTP_STATUS.CONFLICT, message, errors);
  }

  static unprocessable(message = 'Unprocessable entity', errors?: ErrorDetails[]): ApiError {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE, message, errors);
  }

  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(HTTP_STATUS.INTERNAL_ERROR, message, undefined, false);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable'): ApiError {
    return new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, message);
  }

  // Validation error helper
  static validation(errors: ErrorDetails[]): ApiError {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE, 'Validation failed', errors);
  }

  // Convert to JSON response format
  toJSON() {
    return {
      success: false,
      statusCode: this.statusCode,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
      ...(process.env.NODE_ENV === 'dev' && { stack: this.stack }),
    };
  }
}

export default ApiError;
