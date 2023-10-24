import { RequestHandler } from "express";
import createError from "http-errors";
import { AuthenticatedRequest } from "./authenticate";

/**
 * Ensures that the caller has the identity of the identityId slug of the request path.
 */
export function authorizeIdentity(): RequestHandler {
  const authorizeIdentityHandler: RequestHandler = async (
    request,
    response,
    next
  ) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const identityIdOfRequest = authenticatedRequest.params.identityId;
    const identityIdOfCaller = authenticatedRequest.user?.identityId;

    // Check if identityId is a member of tenantId
    next(
      identityIdOfRequest === identityIdOfCaller
        ? undefined
        : createError(403, "Unauthorized")
    );
  };
  return authorizeIdentityHandler;
}
