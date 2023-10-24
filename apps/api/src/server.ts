import { json, urlencoded } from "body-parser";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./middleware/logger";
import inventoryRouter from "./routes/inventory-sample";
import { healthHandler } from "./routes/health";
import { noCache } from "./middleware/noCache";
import { authenticate } from "./middleware/authenticate";
import { meHandler } from "./routes/me";
import tenantRouter from "./routes/tenant";
import identityRouter from "./routes/identity";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(logger("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors());

  app.get("/v1/health", noCache, healthHandler);
  app.get("/v1/me", noCache, authenticate(), meHandler);
  app.use("/v1/tenant", noCache, authenticate(), tenantRouter);
  app.use("/v1/identity", noCache, authenticate(), identityRouter);

  // TODO: this is a sample API you want to remove from you app.
  // Note the use of the noCache and authenticate middleware.
  // You can call these sample endpoints by adding a trusted JWT token to the Authorization header, e.g.:
  // curl http://localhost:3001/v1/store -H "Authorization: Bearer $(yarn -s ops jwt)"
  app.use("/v1/store", noCache, authenticate(), inventoryRouter);

  // Default error handler
  app.use(errorHandler);

  return app;
};
