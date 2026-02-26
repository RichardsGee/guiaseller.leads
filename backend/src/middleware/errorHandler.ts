import type { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Common error factories
export const errors = {
  notFound: (resource: string) =>
    new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  unauthorized: (message = 'Unauthorized') =>
    new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = 'Forbidden') =>
    new AppError(message, 403, 'FORBIDDEN'),
  badRequest: (message: string) =>
    new AppError(message, 400, 'BAD_REQUEST'),
  conflict: (message: string) =>
    new AppError(message, 409, 'CONFLICT'),
  validation: (message: string) =>
    new AppError(message, 422, 'VALIDATION_ERROR'),
  internal: (message = 'Internal server error') =>
    new AppError(message, 500, 'INTERNAL_ERROR', false),
};

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    [key: string]: unknown;
  };
}

// Global error handler middleware
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  }

  // Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as unknown as { code: string; meta?: Record<string, unknown> };
    switch (prismaErr.code) {
      case 'P2002':
        statusCode = 409;
        code = 'DUPLICATE_ENTRY';
        message = `Duplicate entry for ${(prismaErr.meta?.target as string[])?.join(', ') || 'field'}`;
        break;
      case 'P2025':
        statusCode = 404;
        code = 'NOT_FOUND';
        message = 'Record not found';
        break;
      default:
        statusCode = 400;
        code = 'DATABASE_ERROR';
        message = 'Database operation failed';
    }
  }

  // Zod validation errors
  if (err.constructor.name === 'ZodError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${code}] ${message}`, err.stack);
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
}
