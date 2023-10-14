import { json, urlencoded } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";
import inventorySample from "./routes/inventory-sample";
import { healthHandler } from "./routes/health";
import { noCache } from "./middleware/noCache";
import { authenticate } from "./middleware/authenticate";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors());

  app.get("/v1/health", noCache, healthHandler);

  // TODO: this is a sample API you want to remove from you app.
  // Note the use of the noCache and authenticate middleware.
  // You can call these sample endpoints by adding a trusted JWT token to the Authorization header, e.g.:
  // curl http://localhost:3001/v1/store -H "Authorization: Bearer $(yarn -s ops jwt)"
  app.use("/v1", noCache, authenticate(), inventorySample);

  // Default error handler
  app.use(errorHandler);

  return app;
};
