import { RequestHandler } from "express";

export const healthHandler: RequestHandler = (req, res) => {
  return res.json({
    ok: true,
    imageTag: process.env.LETSGO_IMAGE_TAG || "unknown",
    updatedAt: process.env.LETSGO_UPDATED_AT || "unknown",
  });
};
