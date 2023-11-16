/**
 * The package helps manage trust in LetsGo. It provies functions for managing issuers, identities,
 * and issuing and verifying JWTs,
 *
 * @module
 */

export * from "./issuer";
export * from "./jwt";
export * from "./keyResolver";
export * from "./identity";

const IdentityIdPrefix = "idn";

/**
 * Identity uniquely describes an authenticated user in the system.
 */
export interface Identity {
  /**
   * The issuer identifier of the identity.
   */
  iss: string;
  /**
   * The subject identifier of the identity, unique within the issuer.
   */
  sub: string;
}

/**
 * Serializes an {@link Identity} into a string `identityId`. `
 * @param identity The identity to serialize.
 * @returns identity Id
 */
export function serializeIdentity(identity: Identity): string {
  return `${IdentityIdPrefix}-${Buffer.from(
    `${encodeURIComponent(identity.iss)}:${encodeURIComponent(identity.sub)}`
  ).toString("hex")}`;
}

/**
 * Deserializes identity Id into an {@link Identity}.
 * @param identity Identity Id
 * @returns Deserialized identity.
 */
export function deserializeIdentity(identity: string): Identity {
  try {
    const identityCore = Buffer.from(
      identity.substring(IdentityIdPrefix.length + 1),
      "hex"
    ).toString();
    const [iss, sub] = identityCore.split(":");
    if (!iss || !sub || iss.length === 0 || sub.length === 0) {
      throw new Error(`Malformed`);
    }
    return { iss: decodeURIComponent(iss), sub: decodeURIComponent(sub) };
  } catch (e: any) {
    throw new Error(`Unable to parse identity: ${identity}`);
  }
}
