import {
  Identity,
  verifyJwt,
  serializeIdentity,
  TenantIdClaim,
} from "@letsgo/trust";
import {
  DefaultRegion,
  DefaultDeployment,
  StaticJwtAudience,
} from "@letsgo/constants";
import { RequestHandler, Request } from "express";
import createError from "http-errors";
import { Jwt, JwtPayload } from "jsonwebtoken";

/**
 * Audience is required to verify JWTs. We use a logical audience value (letsgo:service by default)
 * to facilitate setting up the third party token issuer (e.g. Auth0) to issue tokens for the service
 * regardless if it runs on localhost or in the cloud.
 *
 * One can always customize the audience value by setting the LETSGO_API_AUDIENCE environment variable
 * via SSM (yarn ops set) or in the .env file.
 */
const audience = process.env.LETSGO_API_AUDIENCE || StaticJwtAudience;
console.log("AUDIENCE SET TO", audience);

export interface LetsGoUser {
  identityId: string;
  identity: Identity;
  jwt: string;
  decodedJwt: Jwt;
}

export interface AuthenticatedRequest extends Request {
  user: LetsGoUser;
}

export function isAuthenticatedRequest(
  request: Request
): request is AuthenticatedRequest {
  return (request as AuthenticatedRequest).user !== undefined;
}

export interface AuthenticationOptions {
  /**
   * If the tenantId slug is absent in the request path, use the tenantId claim from the token to
     synthetically populate it. This allows for shorter URLs to be used with access tokens
     that specify the tenantId.
   */
  useTenantIdFromToken?: boolean;
}

export function authenticate(options?: AuthenticationOptions): RequestHandler {
  const authenticationHandler: RequestHandler = async (
    request,
    response,
    next
  ) => {
    const match = (request.headers.authorization || "").match(
      /^Bearer\s+(.*)$/i
    );
    const token = match?.[1];
    if (token) {
      let decodedJwt: Jwt | undefined;
      try {
        decodedJwt = await verifyJwt(
          DefaultRegion,
          DefaultDeployment,
          token,
          audience
        );
      } catch (e: any) {
        next(createError(500, e.message));
        return;
      }
      if (decodedJwt) {
        const identity: Identity = {
          iss: (decodedJwt.payload as JwtPayload).iss as string,
          sub: (decodedJwt.payload as JwtPayload).sub as string,
        };
        (request as AuthenticatedRequest).user = {
          identityId: serializeIdentity(identity),
          identity,
          jwt: token,
          decodedJwt,
        };
        if (options?.useTenantIdFromToken) {
          // If the tenantId slug is absent in the request path, use the tenantId claim from the token to
          // synthetically populate it. This allows for shorter URLs to be used with access tokens
          // that specify the tenantId.
          const tenantIdClaim = (decodedJwt.payload as JwtPayload)[
            TenantIdClaim
          ];
          if (tenantIdClaim && !request.params.tenantId) {
            request.params.tenantId = tenantIdClaim as string;
          }
        }
        next();
        return;
      }
    }
    next(createError(401, "Unauthorized"));
    return;
  };
  return authenticationHandler;
}
