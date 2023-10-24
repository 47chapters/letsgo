import { isIdentityInTenant } from "@letsgo/tenant";
import { RequestHandler } from "express";
import createError from "http-errors";
import { AuthenticatedRequest } from "./authenticate";

/**
 * Ensures that the caller is a member of the tenant specified in the tenantId slug of the request path.
 */
export function authorizeTenant(): RequestHandler {
  const authorizeTenantHandler: RequestHandler = async (
    request,
    response,
    next
  ) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const tenantId = authenticatedRequest.params.tenantId;
    const identityId = authenticatedRequest.user?.identityId;

    // Check if identityId is a member of tenantId
    if (
      tenantId &&
      identityId &&
      (await isIdentityInTenant({ tenantId, identityId }))
    ) {
      next();
      return;
    }

    next(createError(403, "Unauthorized"));
    return;
  };
  return authorizeTenantHandler;
}
