import { DBItem } from "@letsgo/db";
import { Request } from "express";

export function pruneResponse(item: DBItem) {
  const response: any = { ...item };
  delete response.key;
  delete response.category;
  delete response.ttl;
  return response;
}

export function getBaseUrl(req: Request) {
  const host = req.headers.host;
  const proto = req.headers["x-forwarded-proto"]
    ? (Array.isArray(req.headers["x-forwarded-proto"])
        ? req.headers["x-forwarded-proto"][0]
        : req.headers["x-forwarded-proto"]
      ).split(",")[0]
    : host?.match(/^localhost/)
    ? "http"
    : "https";
  return `${proto}://${host}`;
}

export function createAbsoluteApiUrl(req: Request, relativeUrl: string) {
  return `${process.env["LETSGO_API_URL"] || getBaseUrl(req)}${relativeUrl}`;
}

export function createAbsoluteWebUrl(relativeUrl: string) {
  if (!process.env["LETSGO_WEB_URL"]) {
    throw new Error(
      "The API server's environment variable 'LETSGO_WEB_URL' is not set"
    );
  }
  return `${process.env["LETSGO_WEB_URL"]}${relativeUrl}`;
}
