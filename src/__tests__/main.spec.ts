import supertest from 'supertest';
import express, {RequestHandler, ErrorRequestHandler} from 'express';
import * as superstruct from 'superstruct';

import { validateRequest, catchValidationError, handleRequest } from '../main';

describe('superstructMiddleware', () => {
  let app: express.Express;
  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  const struct = superstruct.object({
    id: superstruct.string(),
    value: superstruct.coerce(superstruct.number(), superstruct.string(), (val) => Number(val)),
    comment: superstruct.optional(superstruct.string()),
    other: superstruct.defaulted(superstruct.boolean(), false)
  });

  describe.each([
    [validateRequest('body', struct)],
    [validateRequest({ body: struct })]
  ])('validateRequest', (validator) => {
    const handleValidationError = jest.fn<void, Parameters<ErrorRequestHandler>>((_err, _req, res, _next) => res.sendStatus(400));
    const handleSuccess = jest.fn<void, Parameters<RequestHandler>>((_req, res, _next) => res.sendStatus(200));
    const handleGlobalError = jest.fn<void, Parameters<ErrorRequestHandler>>((_err, _req, res, _next) => res.sendStatus(500));

    beforeEach(() => {
      app.post(
        '/',
        validator,
        catchValidationError(handleValidationError),
        handleRequest(handleSuccess),
        handleGlobalError
      );
    });

    afterEach(() => {
      handleValidationError.mockClear();
      handleSuccess.mockClear();
      handleGlobalError.mockClear();
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
      expect(handleGlobalError).not.toBeCalled();
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
      expect(handleGlobalError).not.toBeCalled();
    });

    test('fails validation', async () => {
      await supertest(app)
        .post('/')
        .send({
          id: 'abc',
          value: 'nope'
        })
        .expect(400);

      expect(handleValidationError).toBeCalled();
      expect(handleSuccess).not.toBeCalled();
      expect(handleGlobalError).not.toBeCalled();
    });
  });
});
