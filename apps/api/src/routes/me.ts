import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate";
import { JwtPayload } from "jsonwebtoken";

export const meHandler: RequestHandler = (req, res) => {
  const request = req as AuthenticatedRequest;
  return res.json({
    iss: (request.user.decodedJwt.payload as JwtPayload).iss,
    sub: (request.user.decodedJwt.payload as JwtPayload).sub,
  });
};
