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
export function validateRequest<T, S>(prop: ValidationProps<T, S>, options?: ValidateOptions): RequestHandler;
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
export function validateRequest<T, S>(prop: keyof Request, struct: Struct<T, S>, options?: ValidateOptions): RequestHandler;
export function validateRequest<T, S>(prop: keyof Request | ValidationProps<T, S>, struct?: Struct<T, S> | ValidateOptions, options?: ValidateOptions): RequestHandler {
  let validators: Array<(req: Request) => void> = [];
  if (typeof prop === 'object') {
    options = struct as ValidateOptions;
    validators = Object.entries(prop)
      .map(([key, struct]) => buildValidator(key as keyof Request, struct, options));
  } else if (typeof prop === 'string' && typeof struct !== 'undefined') {
    validators = [
      buildValidator(prop, struct as Struct<T, S>, options)
    ];
  }

  if (!validators.length) {
    throw new Error('Invalid validation middleware props');
  }

  return (req, _res, next) => {
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
  if (error instanceof StructError) return handler(error, req, res, next);
  else throw error;
}

/// Internal Utils

function buildValidator<T, S>(prop: keyof Request, struct: Struct<T, S>, options: ValidateOptions = {coerce: true, mask: false}) {
  return (req: Request) => {
    const data = req[prop];

    const [error, value] = validate(data, struct, options);
    if (error) {
      debug(`Validation error on key (${error.key}) in request`);

      throw error;
    }

    // Store a copy of the existing object for reference
    (req as any)[`_${String(prop)}`] = data;

    // Overwrite the existing object with the validated object
    // This is so any defaults or coercion can be applied
    (req as any)[`${String(prop)}`] = value;
  }
}

/// Types

export interface ValidateOptions {
  coerce?: boolean;
  mask?: boolean;
};

export type ValidationProps<T, S> =
  | {body: Struct<T, S>}
  | {query: Struct<T, S>}
  | {params: Struct<T, S>}
  | {cookies: Struct<T, S>}
  | {signedCookies: Struct<T, S>}
  | {protocol: Struct<T, S>}
  | {secure: Struct<T, S>}
  | {fresh: Struct<T, S>}
  | {stale: Struct<T, S>}
  | {xhr: Struct<T, S>}

export interface ValidationErrorRequestHandler extends ErrorRequestHandler {
  (handler: (err: StructError, ...args: Parameters<RequestHandler>) => void): ErrorRequestHandler
}
