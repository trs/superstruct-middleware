import { validate } from 'superstruct';
import buildDebug from 'debug';

import type { RequestHandler } from 'express';
import type { Struct } from 'superstruct';

const debug = buildDebug('superstruct-middleware');

export const superstructMiddleware = <T = unknown, S = unknown>(definition: RequestStructDefinition<T, S>): RequestHandler => {
  const key = 'body' in definition ? 'body'
    : 'params' in definition ? 'params'
    : 'query' in definition ? 'query'
    : null;
  if (!key) throw new Error('Missing validation key');

  const struct = definition[key as keyof typeof definition];

  return (req, _, next) => {
    debug(`Checking request property: ${key}`);

    const data = (req as any)[key];

    const [error, value] = validate(data, struct, {coerce: true});
    if (error) {
      debug(`Validation error on key (${error.key}) in request property (${key})`);

      throw error;
    }

    (req as any)[`_${key}`] = data;
    (req as any)[key] = value;

    next();
  };
};

export type RequestStructDefinition<T, S> =
  | {body: Struct<T, S>}
  | {params: Struct<T, S>}
  | {query: Struct<T, S>}
