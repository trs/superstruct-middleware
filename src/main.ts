import { validate, StructError } from 'superstruct';
import buildDebug from 'debug';

import type { RequestHandler, ErrorRequestHandler, Request, Response } from 'express';
import type { Struct } from 'superstruct';

const debug = buildDebug('superstruct-middleware');

export function validateRequest<T, S>(prop: keyof Request, struct: Struct<T, S>): RequestHandler {
  return (req, res, next) => {
    const data = req[prop];

    const [error, value] = validate(data, struct, {coerce: true});
    if (error) {
      debug(`Validation error on key (${error.key}) in request`);

      throw error;
    }

    (req as any)[`_${String(prop)}`] = data;
    (req as any)[`${String(prop)}`] = value;

    next();
  };
}

export const catchValidationError: ValidationErrorRequestHandler = (handler) => (error, req, res, next) => {
  if (error instanceof StructError) return handler(error, res, res, next);
  else throw error;
}

export default validateRequest;

export interface ValidationErrorRequestHandler extends ErrorRequestHandler {
  (handler: (err: StructError, ...args: Parameters<RequestHandler>) => void): ErrorRequestHandler
}
