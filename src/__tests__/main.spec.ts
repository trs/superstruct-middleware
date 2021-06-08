import supertest from 'supertest';
import express, { ErrorRequestHandler, RequestHandler } from 'express';
import * as superstruct from 'superstruct';

import {superstructMiddleware} from '../main';

describe('superstructMiddleware', () => {
  let app: express.Express;
  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('validation', () => {
    const handleValidationError: ErrorRequestHandler = jest.fn((_err, _req, res, _next) => res.send(501));
    const handleSuccess: RequestHandler = jest.fn((_req, res, _next) => res.send(200));

    beforeEach(() => {
      app.post(
        '/',
        superstructMiddleware('body', superstruct.object({
          id: superstruct.string(),
          value: superstruct.coerce(superstruct.number(), superstruct.string(), (val) => Number(val)),
          comment: superstruct.optional(superstruct.string()),
          other: superstruct.defaulted(superstruct.boolean(), false)
        })),
        handleValidationError,
        handleSuccess
      );
    });

    test('correct', async () => {
      await supertest(app)
        .post('/')
        .send({
          id: 'abc',
          value: 4
        })
        .expect(200);
    });

    test('coerce', async () => {
      await supertest(app)
        .post('/')
        .send({
          id: 'abc',
          value: 4
        })
        .expect(200);
    });

    test('incorrect', async () => {
      await supertest(app)
        .post('/')
        .send({
          id: 'abc',
          value: 'nope'
        })
        .expect(501);
    });
  });
});
