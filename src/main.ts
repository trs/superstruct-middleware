import { validate, StructError } from 'superstruct';
import buildDebug from 'debug';

import type { RequestHandler, ErrorRequestHandler, Request } from 'express';
import type { Struct } from 'superstruct';

const debug = buildDebug('superstruct-middleware');

/// Middleware

/**
 * Create a superstruct validation express middleware handler.
 * @param prop Record where each key is a Request prop and the value is a superstruct struct type.
 * @returns `RequestHandler`
 * @example
 * validateRequest({
 *   body: object({
 *     id: string()
 *   })
 * });
 */
export function validateRequest(prop: ValidationProps): RequestHandler;
/**
 * Create a superstruct validation express middleware handler.
 * @param prop Name of Request prop.
 * @param struct Superstruct struct type.
 * @returns `RequestHandler`
 * @example
 * validateRequest('body', object({
 *   id: string()
 * }));
 */
export function validateRequest<T, S>(prop: keyof Request, struct: Struct<T, S>): RequestHandler;
export function validateRequest<T, S>(prop: keyof Request | ValidationProps, struct?: Struct<T, S>): RequestHandler {
  let validators: Array<(req: Request) => void> = [];
  if (typeof prop === 'object') {
    validators = buildAllValidators(prop);
  } else if (typeof prop === 'string' && typeof struct !== 'undefined') {
    validators = [buildValidator(prop, struct)];
  }

  if (!validators.length) {
    throw new Error('Invalid validation middleware props');
  }

  return (req, res, next) => {
    for (const validator of validators) {
      validator(req);
    }
    next();
  };
}

/**
 * Create an express error middleware that only handles a superstruct StructError.
 *
 * This is useful for handling validation errors, but ignoring any other express errors that may come down in the chain.
 * @param handler Function taking the same arguments as `ErrorRequestHandler`
 * @returns `ErrorRequestHandler`
 */
export const catchValidationError: ValidationErrorRequestHandler = (handler) => (error, req, res, next) => {
  if (error instanceof StructError) return handler(error, res, res, next);
  else throw error;
}

/// Internal Utils

function buildValidator<T, S>(prop: keyof Request, struct: Struct<T, S>) {
  return (req: Request) => {
    const data = req[prop];

    const [error, value] = validate(data, struct, {coerce: true});
    if (error) {
      debug(`Validation error on key (${error.key}) in request`);

      throw error;
    }

    (req as any)[`_${String(prop)}`] = data;
    (req as any)[`${String(prop)}`] = value;
  }
}

function buildAllValidators(prop: ValidationProps) {
  return Object.entries(prop)
    .map(([key, struct]) => buildValidator(key as keyof Request, struct));
}

/// Types

export type ValidationProps = Record<keyof Request, Struct>;

export interface ValidationErrorRequestHandler extends ErrorRequestHandler {
  (handler: (err: StructError, ...args: Parameters<RequestHandler>) => void): ErrorRequestHandler
}
