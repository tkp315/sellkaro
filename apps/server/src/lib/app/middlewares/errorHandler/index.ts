import { Request, Response, NextFunction, Application } from 'express';
import ApiError from '@utils/apiError.js';

// 404 handler - for routes that don't exist
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

// Global error handler
const errorHandler = (err: Error | ApiError, req: Request, res: Response, _next: NextFunction) => {
  // Default values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] | undefined;
  let stack: string | undefined;

  // Check if it's our custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'dev') {
    stack = err.stack;
  }

  // Log error
  console.error(`❌ [${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'dev' && stack) {
    console.error(stack);
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    ...(stack && { stack }),
  });
};

// Apply error handlers to app (call this after all routes)
export function applyErrorHandlers(app: Application): void {
  app.use(notFoundHandler);
  app.use(errorHandler);
}

export { notFoundHandler, errorHandler };
export default { applyErrorHandlers, notFoundHandler, errorHandler };
