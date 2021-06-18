import supertest from 'supertest';
import express from 'express';
import * as superstruct from 'superstruct';

import { validateRequest, catchValidationError } from '../main';

describe('superstructMiddleware', () => {
  let app: express.Express;
  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('validateRequest', () => {
    const handleValidationError = jest.fn((_err, _req, res, _next) => res.sendStatus(501));
    const handleSuccess = jest.fn((_req, res, _next) => res.sendStatus(200));

    beforeEach(() => {
      app.post(
        '/',
        validateRequest('body', superstruct.object({
          id: superstruct.string(),
          value: superstruct.coerce(superstruct.number(), superstruct.string(), (val) => Number(val)),
          comment: superstruct.optional(superstruct.string()),
          other: superstruct.defaulted(superstruct.boolean(), false)
        })),
        catchValidationError(handleValidationError),
        handleSuccess
      );
    });

    afterEach(() => {
      handleValidationError.mockClear();
      handleSuccess.mockClear();
    });

    test('passes validation', async () => {
      await supertest(app)
        .post('/')
        .send({
          id: 'abc',
          value: 4
        })
        .expect(200);

      expect(handleValidationError).not.toBeCalled();
      expect(handleSuccess).toBeCalled();
    });

    test('coerces values to match type', async () => {
      await supertest(app)
        .post('/')
        .send({
          id: 'abc',
          value: '4'
        })
        .expect(200);

      expect(handleValidationError).not.toBeCalled();
      expect(handleSuccess).toBeCalled();
    });

    test('fails validation', async () => {
      await supertest(app)
        .post('/')
        .send({
          id: 'abc',
          value: 'nope'
        })
        .expect(501);

      expect(handleValidationError).toBeCalled();
      expect(handleSuccess).not.toBeCalled();
    });
  });
});
