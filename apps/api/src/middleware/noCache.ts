import { RequestHandler } from "express";

/**
 * Prevent caching of responses on routes with this middleware.
 */
export const noCache: RequestHandler = (request, response, next) => {
  response.setHeader("Cache-Control", "no-cache");
  next();
};
