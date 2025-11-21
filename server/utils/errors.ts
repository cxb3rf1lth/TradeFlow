import { Response } from 'express';

export interface ErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Send standardized error response
 * In production, sensitive error details are hidden
 */
export function sendErrorResponse(
  res: Response,
  error: unknown,
  statusCode: number = 500
): void {
  const message = getErrorMessage(error);

  const response: ErrorResponse = {
    error: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal Server Error'
      : message,
  };

  // In development, include error details for debugging
  if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
    response.details = {
      stack: error.stack,
      name: error.name,
    };
  }

  res.status(statusCode).json(response);
}

/**
 * Send validation error response
 */
export function sendValidationError(
  res: Response,
  message: string,
  details?: unknown
): void {
  const response: ErrorResponse = { error: message };
  if (details) {
    response.details = details;
  }
  res.status(400).json(response);
}
