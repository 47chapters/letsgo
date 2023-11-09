import { json, urlencoded } from "body-parser";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./middleware/logger";
import { healthHandler } from "./routes/health";
import { noCache } from "./middleware/noCache";
import { authenticate } from "./middleware/authenticate";
import { meHandler } from "./routes/me";
import tenantRouter from "./routes/tenant";
import identityRouter from "./routes/identity";
import stripeRouter from "./routes/stripe";
import contactRouter from "./routes/contact";

export const createServer = () => {
  const app = express();
  app.disable("x-powered-by").use(logger("dev"));

  app.use("/v1/stripe", stripeRouter);

  app
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors());

  app.get("/v1/health", noCache, healthHandler);
  app.get("/v1/me", noCache, authenticate(), meHandler);
  app.use("/v1/tenant", noCache, authenticate(), tenantRouter);
  app.use("/v1/identity", noCache, authenticate(), identityRouter);
  app.use("/v1/contact", noCache, contactRouter);

  app.use(errorHandler);

  return app;
};
