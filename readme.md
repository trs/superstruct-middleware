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

// Create validation using object

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

// Or

// Create validation using prop key


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

### `validateRequest(prop, struct, [options])` / `validateRequest({[prop]: struct}, [options])`

> Create an express handler to validate the request using a superstruct structure.

`prop`: A request object property indicating which object to validate.

`struct`: The superstruct structure type to validate against.

`options`: Any options to pass to superstruct's validate method.

> Note: This function is overloaded, meaning you can either pass in two arguments (the prop and struct), or a single record argument.
### `catchValidationError(handler)`

> Create an express handler to catch and handle superstruct validation errors.

`handler`: An express error handler function. First argument is the struct error from the validate function. The remaining arguments are the same as any other express request handler.
