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

  const isDev = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development';

  // Check if it's our custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error && isDev) {
    // In production, keep the generic message to avoid leaking internals
    // (Prisma table names, constraint names, JWT details, etc.)
    message = err.message || message;
  }

  // Include stack trace in development only
  if (isDev) {
    stack = err.stack;
  }

  // Log error
  console.error(`❌ [${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`);
  if (isDev && stack) {
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
