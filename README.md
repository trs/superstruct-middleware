# `superstruct-middleware`

> Express middleware for validating requests with `superstruct`

## Prerequisites

This package is deployed to the GitHub Package Repository (GPR). In order to use it you must take some steps.

Authenticate with GPR:

```
npm login --scope=@flashfoodco --registry=https://npm.pkg.github.com

> Username: YOUR GITHUB USERNAME
> Password: YOUR GITHUB TOKEN
> Email: FLASHFOOD-EMAIL-ADDRESS
```

Create a `.npmrc` file in the repo you want to use this package and add this line:

```
@flashfoodco:registry=https://npm.pkg.github.com
```

## Installation

```bash
npm install superstruct@^0.15 @flashfoodco/superstruct-middleware
```

_or_

```bash
yarn add superstruct@^0.15 @flashfoodco/superstruct-middleware
```

## Usage

```ts
import express from "express";
import { number, object } from "superstruct";
import { validateRequest, catchValidationError, handleRequest } from "@flashfoodco/superstruct-middleware";

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
  handleRequest((req, res, next) => {
    // handle route
    res.send(200);
  }),
);

// -- Or --

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
  handleRequest((req, res, next) => {
    // handle route
    res.send(200);
  }),
);

app.listen();
```

## API

### `validateRequest(prop, struct, [options])` _or_
### `validateRequest({[prop]: struct}, [options])`

Create an express handler to validate the request using a superstruct structure.

`prop`: A request object property indicating which object to validate.

`struct`: The superstruct structure type to validate against.

`options`: Any options to pass to superstruct's validate method.

> Note: This function is overloaded, meaning you can either pass in two arguments (the prop and struct), or a single record argument.
### `catchValidationError(handler)`

Create an express handler to catch and handle superstruct validation errors.

`handler`: An express error handler function. First argument is the struct error from the validate function. The remaining arguments are the same as any other express request handler.

### `handleRequest(handler)`

Helper function for typing a request handler since sometimes Typescript can't infer types on handler functions.

### `handleError(handler)`

Helper function for typing an error request handler since sometimes Typescript can't infer types on handler functions.

> Note: If handling the superstruct validation error, use `catchValidationError` instead.

## Publishing

To publish a new version, create a commit with a new version inside `package.json` and push to Github. That version will automatically be published using Github workflows.
