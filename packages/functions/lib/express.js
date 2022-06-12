const express = require("express");
const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });

/**
 * Creates an express app with standard middleware and requested extra middlewares.
 *
 * @param {function[] | undefined} middlewares List of express middlewares to add
 * @return {Express} express app
 */
exports.createExpressRequest = (...middlewares) => {
  const app = express();
  app.use(cors);
  app.use(cookieParser);

  for (const middleware of middlewares) {
    app.use(middleware);
  }

  return app;
};
