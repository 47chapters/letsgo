import morgan from "morgan";

let skipping = false;

/**
 * Prevent logging of successful /v1/health requests after the first one.
 * This is to reduce noise and size of the Cloud Watch logs.
 */
export const logger = (format: string) =>
  morgan(format, {
    skip: (req, res) => {
      if (
        req.method === "GET" &&
        req.url === "/v1/health" &&
        res.statusCode === 200
      ) {
        if (skipping) {
          return true;
        }
        skipping = true;
      }
      return false;
    },
  });
