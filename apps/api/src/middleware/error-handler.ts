import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  next
) => {
  const status = error.statusCode || error.status || 500;
  console.log(
    `EXPRESS PIPELINE ERROR: HTTP ${status} ${error.stack || error.message}`
  );
  response.status(status).json({
    statusCode: status,
    message: status < 500 ? error.message : "Internal Server Error",
  });
};
