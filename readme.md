# `superstruct-middleware`

> Express middleware for validating requests with `superstruct`

## Installation

```bash
npm install superstruct-middleware superstruct
```

_or_

```bash
yarn add superstruct-middleware superstruct
```

## Usage

```ts
import express from "express";
import { number, object } from "superstruct";
import { validateRequest, catchValidationError } from "superstruct-middleware";

const app = express();

app.post(
  "/api/endpoint",
  validateRequest({
    body: object({
      id: number(),
    })
  }),
  catchValidationError((structError, req, res, next) => {
    // handle validation error
    res.send(500);
  }),
  (req, res, next) => {
    // handle route
    res.send(200);
  },
);

app.post(
  "/api/endpoint",
  validateRequest(
    "body",
    object({
      id: number(),
    }),
  ),
  catchValidationError((structError, req, res, next) => {
    // handle validation error
    res.send(500);
  }),
  (req, res, next) => {
    // handle route
    res.send(200);
  },
);

app.listen();
```

## API

### `validateRequest`

> Create an express handler to validate the request using a superstruct structure.

First argument takes a property of the request object to validate.

Second argument is the superstruct structure type.

### `catchValidationError`

> Create an express handler to catch and handle superstruct validation errors.

First argument is the struct error from the validate function. The remaining arguments are the same as any other express request handler.
