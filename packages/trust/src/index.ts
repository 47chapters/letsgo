export * from "./issuer";
export * from "./jwt";
export * from "./keyResolver";

const IdentityIdPrefix = "idn";

export interface Identity {
  iss: string;
  sub: string;
}

export function serializeIdentity(identity: Identity): string {
  return `${IdentityIdPrefix}-${Buffer.from(
    `${encodeURIComponent(identity.iss)}:${encodeURIComponent(identity.sub)}`
  ).toString("hex")}`;
}

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
