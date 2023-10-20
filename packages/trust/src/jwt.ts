import { getSignatureVerificationKey } from "./keyResolver";
import { Jwt, JwtPayload, decode, sign, verify } from "jsonwebtoken";
import { PkiIssuer, getActiveIssuer } from "./issuer";
import { StaticJwtAudience } from "@letsgo/constants";

const DefaultExpiry = "8h";

interface CreateJwtOptions {
  issuer?: PkiIssuer;
  subject?: string;
  audience?: string;
  expiresIn?: string;
}

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
