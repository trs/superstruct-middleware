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
import validate from "superstruct-middleware";

const app = express();

app.post(
  "api",
  validate(
    "body",
    object({
      id: number(),
    }),
  ),
  (err, req, res, next) => {
    // handle validation error
    res.send(500);
  },
  (req, res, next) => {
    // handle route
    res.send(200);
  },
);

app.listen();
```
