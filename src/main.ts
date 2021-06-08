import { validate } from 'superstruct';
import buildDebug from 'debug';

import type { RequestHandler } from 'express';
import type { Struct } from 'superstruct';

const debug = buildDebug('superstruct-middleware');

export const superstructMiddleware = <T = unknown, S = unknown>(prop: keyof Request, struct: Struct<T, S>): RequestHandler => {
  return (req, _, next) => {
    debug(`Checking request property: ${prop}`);

    const data = (req as any)[prop];

    const [error, value] = validate(data, struct, {coerce: true});
    if (error) {
      debug(`Validation error on key (${error.key}) in request property (${prop})`);

      throw error;
    }

    (req as any)[`_${prop}`] = data;
    (req as any)[prop] = value;

    next();
  };
}

export type RequestStructDefinition<T, S> =
  | {body: Struct<T, S>}
  | {params: Struct<T, S>}
  | {query: Struct<T, S>}
