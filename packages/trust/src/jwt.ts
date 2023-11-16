import { getSignatureVerificationKey } from "./keyResolver";
import { Jwt, JwtPayload, decode, sign, verify } from "jsonwebtoken";
import { PkiIssuer, getActiveIssuer } from "./issuer";
import { StaticJwtAudience } from "@letsgo/constants";

/**
 * Default expiry for JWT access tokens created using built-in PKI issuers.
 */
export const DefaultExpiry = "8h";

/**
 * Options for creating a JWT access token.
 */
export interface CreateJwtOptions {
  /**
   * The built-in PKI issuer to use to sign the JWT. If not specified, the active issuer will be used.
   */
  issuer?: PkiIssuer;
  /**
   * The `sub` claim of the JWT. If not specified, the same value as the `iss` claim will be used.
   */
  subject?: string;
  /**
   * The `aud` claim of the JWT. If not specified, the value of the `LETSGO_API_AUDIENCE` environment variable will
   * be used if specified, or `letsgo:service` otherwise.
   */
  audience?: string;
  /**
   * Expiration time of the JWT. If not specified, the default expiry will be used. The value can be a number of seconds,
   * or an expression like `8h`, `2d`, etc. If `0` is specified, a non-expiring JWT token is issued.
   */
  expiresIn?: string;
}

/**
 * Creates a new JWT access token.
 * @param options Options for creating the JWT.
 * @returns The JWT access token.
 */
export async function createJwt(options?: CreateJwtOptions): Promise<string> {
  options = options || {};
  options.audience =
    options.audience || process.env.LETSGO_API_AUDIENCE || StaticJwtAudience;
  if (options.audience.length === 0) {
    throw new Error("The audience cannot be empty");
  }
  options.expiresIn = options.expiresIn || DefaultExpiry;
  options.issuer = options.issuer || (await getActiveIssuer());
  if (!options.issuer) {
    throw new Error(
      "No issuer specified and no active issuer found in the system"
    );
  }

  // Create JWT
  const token = sign({}, options.issuer.privateKey, {
    algorithm: "RS256",
    ...(+options.expiresIn === 0 ? {} : { expiresIn: options.expiresIn }),
    audience: options.audience,
    issuer: options.issuer.key,
    keyid: options.issuer.kid,
    subject: options.subject || options.issuer.key,
  });

  return token;
}

/**
 * Verifies a JWT access token. A valid JWT must be signed by one of the trusted issuers in the system. Public keys
 * of the issuers used to validate access token signature are cached in memory for up to 5 minutes, so removing
 * a trusted issuer may take up to 5 minutes to be effective.
 * @param region AWS region.
 * @param deployment LetsGo deployment name.
 * @param token JWT access token to verify.
 * @param audience Expected value of the `aud` claim in the JWT.
 * @returns Parsed, validated JWT or undefined if the token is invalid.
 */
export async function verifyJwt(
  region: string,
  deployment: string,
  token: string,
  audience: string
): Promise<Jwt | undefined> {
  const decodedJwt = decode(token, { json: true, complete: true });
  if (!decodedJwt) {
    return undefined;
  }
  const kid = decodedJwt?.header.kid;
  const iss = (decodedJwt?.payload as JwtPayload).iss;
  if (!kid || !iss) {
    return undefined;
  }
  const publicKey = await getSignatureVerificationKey(
    region,
    deployment,
    iss,
    kid
  );
  if (!publicKey) {
    return undefined;
  }
  try {
    verify(token, publicKey, { audience });
  } catch (e: any) {
    return undefined;
  }
  return decodedJwt;
}
