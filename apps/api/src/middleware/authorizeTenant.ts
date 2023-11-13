import { isIdentityInTenant } from "@letsgo/tenant";
import { RequestHandler } from "express";
import createError from "http-errors";
import { AuthenticatedRequest } from "./authenticate";
import { isBuiltInIssuer } from "@letsgo/trust";
import { JwtPayload } from "jsonwebtoken";

export interface AuthorizeTenantOptions {
  authorizeBuiltInIssuer?: boolean;
}

/**
 * Ensures that the caller is a member of the tenant specified in the tenantId slug of the request path.
 */
export function authorizeTenant(
  options?: AuthorizeTenantOptions
): RequestHandler {
  const authorizeTenantHandler: RequestHandler = async (
    request,
    response,
    next
  ) => {
    const authenticatedRequest = request as AuthenticatedRequest;
    const tenantId = authenticatedRequest.params.tenantId;
    const identityId = authenticatedRequest.user?.identityId;

    // If tokens issued by the built-in issuers should be authorized,
    // check if the caller's issuer is a built-in issuer
    if (
      options?.authorizeBuiltInIssuer &&
      isBuiltInIssuer(
        (authenticatedRequest.user?.decodedJwt?.payload as JwtPayload).iss || ""
      )
    ) {
      next();
      return;
    }

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
