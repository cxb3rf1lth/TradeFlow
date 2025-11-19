import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const formatIssues = (issues: z.ZodIssue[]) =>
  issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

const isZodError = (error: unknown): error is z.ZodError => {
  return error instanceof z.ZodError;
};

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (isZodError(error)) {
        const details = formatIssues(error.errors);
        return res.status(400).json({
          error: 'Validation failed',
          details,
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (isZodError(error)) {
        const details = formatIssues(error.errors);
        return res.status(400).json({
          error: 'Invalid query parameters',
          details,
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (isZodError(error)) {
        const details = formatIssues(error.errors);
        return res.status(400).json({
          error: 'Invalid parameters',
          details,
        });
      }
      next(error);
    }
  };
};
