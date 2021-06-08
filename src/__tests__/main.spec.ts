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
    beforeEach(() => {
      const handleValidationError: ErrorRequestHandler = (err, req, res, next) => res.send(501);
      const handleSuccess: RequestHandler = (req, res, next) => res.send(200);

      app.post(
        '/',
        superstructMiddleware({
          body: superstruct.object({
            id: superstruct.string(),
            value: superstruct.number(),
            comment: superstruct.optional(superstruct.string())
          })
        }),
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

    test('incorrect', async () => {
      await supertest(app)
        .post('/')
        .send({
          id: 'abc',
          value: '4'
        })
        .expect(501);
    });
  });
});
