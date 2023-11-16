import { getIssuer, isPkiIssuer } from "./issuer";

const Ttl = 5 * 60 * 1000; // 5 minutes

interface KeyCacheData {
  keys?: { [kid: string]: string };
  error?: Error;
}

interface KeyCacheEntry extends KeyCacheData {
  expiresAt: number;
}

interface KeyCache {
  [region: string]: {
    [deployment: string]: {
      [iss: string]: KeyCacheEntry;
    };
  };
}

const keyCache: KeyCache = {};

function putToCache(
  region: string,
  deployment: string,
  iss: string,
  data?: KeyCacheData
) {
  keyCache[region] = keyCache[region] || {};
  keyCache[region][deployment] = keyCache[region][deployment] || {};
  if (data) {
    keyCache[region][deployment][iss] = {
      ...data,
      expiresAt: Date.now() + Ttl,
    };
  } else {
    delete keyCache[region][deployment][iss];
  }
}

function certToPEM(cert: string) {
  const match = cert.match(/.{1,64}/g) || [];
  return `-----BEGIN CERTIFICATE-----\n${match.join(
    "\n"
  )}\n-----END CERTIFICATE-----\n`;
}

function prepadSigned(hex: string) {
  const msb = hex[0];
  if (msb < "0" || msb > "7") {
    return `00${hex}`;
  }
  return hex;
}

function numberToHex(value: number) {
  const asString = value.toString(16);
  if (asString.length % 2) {
    return `0${asString}`;
  }
  return asString;
}

function encodeLengthHex(length: number) {
  if (length <= 127) {
    return numberToHex(length);
  }
  const hexNumber = numberToHex(length);
  const lengthOfLengthByte = 128 + hexNumber.length / 2;
  return numberToHex(lengthOfLengthByte) + hexNumber;
}

function rsaPublicKeyToPEM(modulusB64: string, exponentB64: string) {
  const modulus = Buffer.from(modulusB64, "base64");
  const exponent = Buffer.from(exponentB64, "base64");

  const modulusHex = prepadSigned(modulus.toString("hex"));
  const exponentHex = prepadSigned(exponent.toString("hex"));

  const modlen = modulusHex.length / 2;
  const explen = exponentHex.length / 2;

  const encodedModlen = encodeLengthHex(modlen);
  const encodedExplen = encodeLengthHex(explen);
  const encodedPubkey =
    "30" +
    encodeLengthHex(
      modlen + explen + encodedModlen.length / 2 + encodedExplen.length / 2 + 2
    ) +
    "02" +
    encodedModlen +
    modulusHex +
    "02" +
    encodedExplen +
    exponentHex;

  const der = Buffer.from(encodedPubkey, "hex").toString("base64") as string;

  let pem = `-----BEGIN RSA PUBLIC KEY-----\n`;
  pem += `${(der.match(/.{1,64}/g) || []).join("\n")}`;
  pem += `\n-----END RSA PUBLIC KEY-----\n`;
  return pem;
}

function parseJwks(json: any): { [kid: string]: string } {
  const keys: { [kid: string]: string } = {};
  try {
    for (const key of json.keys) {
      if (
        key.use === "sig" &&
        key.kty === "RSA" &&
        key.kid &&
        ((key.x5c && key.x5c.length) || (key.n && key.e))
      ) {
        keys[key.kid] =
          key.x5c && key.x5c.length
            ? certToPEM(key.x5c[0])
            : rsaPublicKeyToPEM(key.n, key.e);
      }
    }
  } catch (e: any) {
    // best effort - ignore errors
  }
  return keys;
}

/**
 * Returns the public key of an issuer that can be used to validate a JWT access token signature. The combination
 * of `iss` and `kid` uniquely identifies the key. For third-party issuers, the public key is obtained from the
 * [JWKS](https://tools.ietf.org/html/rfc7517) endpoint. For built-in PKI issuers it is read from the `letsgo-issuer` category in the database.
 * The public key is cached in memory for up to 5 minutes, so removing an issuer from the system may not take
 * effect for up to 5 minutes.
 * @param region AWS region.
 * @param deployment LetsGo deployment name.
 * @param iss The `iss` claim value from the access token.
 * @param kid The `kid` claim value from the access token.
 * @returns The RSA public key of the issuer in PEM format or undefined if the key cannot be found.
 */
export async function getSignatureVerificationKey(
  region: string,
  deployment: string,
  iss: string,
  kid: string
): Promise<string | undefined> {
  // Check for cache hit
  let cachedIssuer = keyCache[region]?.[deployment]?.[iss];
  if (cachedIssuer && cachedIssuer.expiresAt > Date.now()) {
    // Cache hit - return previous error, the matching key, or undefined if there is no matching key
    if (cachedIssuer.error) {
      throw cachedIssuer.error;
    }
    return cachedIssuer.keys?.[kid]; // may be undefined
  }
  // Cache miss - fetch keys
  const issuer = await getIssuer(iss, { region, deployment });
  if (!issuer) {
    // Issuer is not trusted in the system - cache this fact
    putToCache(region, deployment, iss, { keys: {} });
    return undefined;
  }
  if (isPkiIssuer(issuer)) {
    // Issuer is trusted and is PKI - cache the public key
    putToCache(region, deployment, iss, {
      keys: { [issuer.kid]: issuer.publicKey },
    });
    return kid === issuer.kid ? issuer.publicKey : undefined;
  }
  // Issuer is trusted and is JWKS - fetch the JWKS and cache the public keys
  try {
    const response = await fetch(issuer.jwks);
    if (!response.ok) {
      throw new Error(
        `Issuer ${iss} JWKS URL ${issuer.jwks} returned ${response.status} ${response.statusText}`
      );
    }
    const jwks: any = await response.json();
    const keys = parseJwks(jwks);
    putToCache(region, deployment, iss, { keys });
    return keys[kid]; // may be undefined
  } catch (e: any) {
    // Error resolving JWKS - cache the error
    putToCache(region, deployment, iss, { error: e });
    throw e;
  }
}
