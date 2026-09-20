import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { ValidationError } from './error.middleware.js';

export const validate = (schema: ZodSchema) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err: ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ValidationError(errorMessages));
      }
      return next(error);
    }
  };
