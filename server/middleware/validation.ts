import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const formatIssues = (issues: z.ZodIssue[]) =>
  issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        return res.status(400).json({
          error: 'Validation failed',
          details: formatIssues(zodError.errors),
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: formatIssues(zodError.errors),
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError;
        return res.status(400).json({
          error: 'Invalid parameters',
          details: formatIssues(zodError.errors),
        });
      }
      next(error);
    }
  };
};
