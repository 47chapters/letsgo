import "dotenv/config";
import { handler } from "./index";
import { createServer, ServerResponse } from "http";

const port = process.env.PORT || 3002;

const httpError = (
  res: ServerResponse,
  statusCode: number,
  message: string
) => {
  res.statusCode = statusCode;
  res.end(JSON.stringify({ statusCode, message }, null, 2));
};

const server = createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/") {
    return httpError(res, 400, "Bad request. Only POST / is accepted.");
  }
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(body);
    } catch (e: any) {
      return httpError(res, 400, "Bad request. Body must be JSON.");
    }
    res.statusCode = 201;
    res.end();
    try {
      const result = await handler(parsedBody, {} as any, (error, result) => {
        throw new Error(
          "Handler's callback call is not supported. Return a promise instead."
        );
      });
    } catch (e: any) {
      console.log("WORKER HANDLER ERROR:", e.stack || e.message || e);
    }
  });
});

server.listen(port, () => {
  console.log(`worker running on ${port}`);
});
