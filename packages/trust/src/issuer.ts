import { VendorPrefix } from "@letsgo/constants";
import {
  getItem,
  putItem,
  DeploymentOptions,
  listItems,
  ListItemsOptions,
  DBItem,
  deleteItem,
} from "@letsgo/db";
import { generateKeyPair, createHash } from "crypto";

const IssuerCategory = `${VendorPrefix}-issuer`;
const ActiveIssuerCategory = `${IssuerCategory}-active`;
const ActiveIssuerKey = "/";

/**
 * Definition of a third-party access token issuer.
 */
export interface JwksIssuer extends DBItem {
  /**
   * The [JWKS](https://tools.ietf.org/html/rfc7517) URL of the issuer.
   */
  jwks: string;
  /**
   * The time when the issuer was created.
   */
  createdAt: string;
}

/**
 * PKI credentials of a built-in PKI issuer.
 */
export interface PkiCredentials {
  /**
   * Public RSA key in PEM format.
   */
  publicKey: string;
  /**
   * Private RSA key in PEM format.
   */
  privateKey: string;
  /**
   * OAuth key identifier.
   */
  kid: string;
  /**
   * The time when the PKI credentials was created.
   */
  createdAt: string;
}

/**
 * Definition of a built-in PKI issuer.
 */
export interface PkiIssuer extends DBItem, PkiCredentials {}

/**
 * An issuer is either a third-party JWKS-based issuer or a built-in PKI-based issuer.
 */
export type Issuer = JwksIssuer | PkiIssuer;

/**
 * Result of listing issuers.
 */
export interface ListIssuersResult {
  /**
   * List of issuers.
   */
  items: Issuer[];
  /**
   * Continuation token for paginated results.
   */
  nextToken?: string;
}

/**
 * Checks if an object is a JWKS issuer.
 * @param issuer Prospective JWKS issuer.
 * @returns True if the object is a JWKS issuer, false otherwise.
 */
export function isJwksIssuer(issuer: any): issuer is JwksIssuer {
  return issuer.jwks !== undefined && issuer.createdAt !== undefined;
}

/**
 * Checks if an object is a PKI issuer.
 * @param issuer Prospective PKI issuer.
 * @returns True if the object is a PKI issuer, false otherwise.
 */
export function isPkiIssuer(issuer: any): issuer is PkiIssuer {
  return (
    issuer.publicKey !== undefined &&
    issuer.privateKey !== undefined &&
    issuer.kid !== undefined &&
    issuer.createdAt !== undefined
  );
}

/**
 * Generates the `iss` claim value for a PKI issuer.
 * @param issuer The PKI issuer.
 * @returns The `iss` claim value.
 */
export const getPkiIss = (issuer: PkiCredentials) =>
  `${VendorPrefix}:${issuer.kid}`;

/**
 * Checks if an `iss` claim value represents a built-in PKI issuer.
 * @param iss The `iss` claim value from an access token.
 * @returns True if the `iss` represents a built-in PKI issuer, false otherwise.
 */
export const isBuiltInIssuer = (iss: string) =>
  iss.startsWith(`${VendorPrefix}:`);

async function createPkiCredentials(): Promise<PkiCredentials> {
  return new Promise((resolve, reject) => {
    const privateKeyEncoding: any = {
      type: "pkcs8",
      format: "pem",
    };

    generateKeyPair(
      "rsa",
      {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding,
      },
      (error, publicKey, privateKey) => {
        if (error) {
          return reject(error);
        }
        const kid = createHash("sha256")
          .update(publicKey)
          .digest("hex")
          .substring(0, 16);

        resolve({
          publicKey,
          privateKey,
          kid,
          createdAt: new Date().toISOString(),
        });
      }
    );
  });
}

/**
 * Lists issuers in the system. This function is paginated. If the results contains a `nextToken` property, subsequent
 * page of the results can be fetched by passing the `nextToken` as an option to the next call of this function.
 * @param options Options for listing issuers.
 * @returns The list of issuers and the optional continuation token for paginated results.
 */
export async function listIssuers(
  options?: ListItemsOptions
): Promise<ListIssuersResult> {
  return listItems(IssuerCategory, "", options) as Promise<ListIssuersResult>;
}

/**
 * Adds a new third party JWKS issuer to the system.
 * @param issuerId The unique identifier of the issuer.
 * @param jwks The [JWKS](https://tools.ietf.org/html/rfc7517) URL of the issuer.
 * @param options Location of the deployment.
 */
export async function addJwksIssuer(
  issuerId: string,
  jwks: string,
  options?: DeploymentOptions
): Promise<void> {
  await putItem(
    {
      category: IssuerCategory,
      key: issuerId,
      jwks,
      createdAt: new Date().toISOString(),
    },
    options
  );
}

/**
 * Returns the active built-in PKI issuer if one exists.
 * @param options Location of the deployment.
 * @returns Active PKI issuer or undefined if no active PKI issuer exists.
 */
export async function getActiveIssuer(
  options?: DeploymentOptions
): Promise<PkiIssuer | undefined> {
  const activeIssuerRef = await getItem(ActiveIssuerCategory, ActiveIssuerKey, {
    ...options,
    consistentRead: true,
  });
  if (!activeIssuerRef) {
    return undefined;
  }
  const activeIssuer = await getItem(IssuerCategory, activeIssuerRef.issuer, {
    ...options,
    consistentRead: true,
  });
  return activeIssuer as PkiIssuer;
}

/**
 * Sets active built-in PKI issuer.
 * @param iss Issuer identifier
 * @param options Location of the deployment.
 * @returns The new, active PKI issuer.
 */
export async function setActiveIssuer(
  iss: string,
  options?: DeploymentOptions
): Promise<PkiIssuer> {
  const issuer = await getItem(IssuerCategory, iss, {
    ...options,
    consistentRead: true,
  });
  if (!issuer) {
    throw new Error(`Issuer not found`);
  }
  if (!isPkiIssuer(issuer)) {
    throw new Error(
      `Issuer is not a PKI issuer. Only PKI issuers can be set active.`
    );
  }
  await putItem(
    {
      category: ActiveIssuerCategory,
      key: ActiveIssuerKey,
      issuer: iss,
      modifiedAt: new Date().toISOString(),
    },
    options
  );
  return issuer;
}

/**
 * Removes an issuer from the system. Access tokens issued by the issuer will no longer be trusted.
 * @param iss Issuer identifier
 * @param options Location of the deployment.
 */
export async function deleteIssuer(
  iss: string,
  options?: DeploymentOptions
): Promise<void> {
  return deleteItem(IssuerCategory, iss, options);
}

/**
 * Gets an issuer if one exists.
 * @param iss Issuer identifier
 * @param options Location of the deployment.
 * @returns Issuer or undefined if the issuer does not exist.
 */
export async function getIssuer(
  iss: string,
  options?: DeploymentOptions
): Promise<Issuer | undefined> {
  return getItem(IssuerCategory, iss, options) as Promise<Issuer>;
}

/**
 * Creates and stores a new built-in PKI issuer and optionally sets it as active. A new private/public key pair is created for the
 * issuer.
 * @param setActive If true, the new issuer is set as active.
 * @param options Location of the deployment.
 * @returns The new build-in PKI issuer.
 */
export async function createIssuer(
  setActive: boolean,
  options?: DeploymentOptions
): Promise<PkiIssuer> {
  const credentials = await createPkiCredentials();
  const iss = getPkiIss(credentials);
  const issuer = {
    ...credentials,
    category: IssuerCategory,
    key: iss,
  };
  await putItem(issuer, options);
  if (setActive) {
    await putItem(
      {
        category: ActiveIssuerCategory,
        key: ActiveIssuerKey,
        issuer: iss,
        modifiedAt: new Date().toISOString(),
      },
      options
    );
  }
  return issuer;
}
