import { json, urlencoded } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/message/:name", (req, res) => {
      return res.json({ message: `hello ${req.params.name}` });
    })
    .get("/v1/health", (req, res) => {
      return res.json({
        ok: true,
        imageTag: process.env.LETSGO_IMAGE_TAG || "unknown",
        updatedAt: process.env.LETSGO_UPDATED_AT || "unknown",
      });
    });

  return app;
};
