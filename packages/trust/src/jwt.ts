import { getSignatureVerificationKey } from "./keyResolver";
import { Jwt, JwtPayload, decode, sign, verify } from "jsonwebtoken";
import { PkiIssuer } from "./issuer";

const DefaultExpiry = "8h";

interface CreateJwtOptions {
  issuer: PkiIssuer;
  audience: string[];
  expiresIn?: string;
}

export async function createJwt(options: CreateJwtOptions): Promise<string> {
  if (options.audience.length === 0) {
    throw new Error(`No audience specified`);
  }

  // Create JWT
  const token = sign({}, options.issuer.privateKey, {
    algorithm: "RS256",
    expiresIn: options.expiresIn || DefaultExpiry,
    audience: options.audience,
    issuer: options.issuer.key,
    keyid: options.issuer.kid,
    subject: options.issuer.key,
  });

  return token;
}

export async function verifyJwt(
  region: string,
  deployment: string,
  token: string,
  audience: string[]
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
