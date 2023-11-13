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

interface JwksIssuer extends DBItem {
  jwks: string;
  createdAt: string;
}

interface PkiCredentials {
  publicKey: string;
  privateKey: string;
  kid: string;
  createdAt: string;
}

export interface PkiIssuer extends DBItem, PkiCredentials {}

type Issuer = JwksIssuer | PkiIssuer;

export interface ListIssuersResult {
  items: Issuer[];
  nextToken?: string;
}

export function isJwksIssuer(issuer: any): issuer is JwksIssuer {
  return issuer.jwks !== undefined && issuer.createdAt !== undefined;
}

export function isPkiIssuer(issuer: any): issuer is PkiIssuer {
  return (
    issuer.publicKey !== undefined &&
    issuer.privateKey !== undefined &&
    issuer.kid !== undefined &&
    issuer.createdAt !== undefined
  );
}

export const getPkiIss = (issuer: PkiCredentials) =>
  `${VendorPrefix}:${issuer.kid}`;

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

export async function listIssuers(
  options?: ListItemsOptions
): Promise<ListIssuersResult> {
  return listItems(IssuerCategory, "", options) as Promise<ListIssuersResult>;
}

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

export async function setActiveIssuer(
  issuerKey: string,
  options?: DeploymentOptions
): Promise<PkiIssuer> {
  const issuer = await getItem(IssuerCategory, issuerKey, {
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
      issuer: issuerKey,
      modifiedAt: new Date().toISOString(),
    },
    options
  );
  return issuer;
}

export async function deleteIssuer(
  issuerKey: string,
  options?: DeploymentOptions
): Promise<void> {
  return deleteItem(IssuerCategory, issuerKey, options);
}

export async function getIssuer(
  issuerKey: string,
  options?: DeploymentOptions
): Promise<Issuer | undefined> {
  return getItem(IssuerCategory, issuerKey, options) as Promise<Issuer>;
}

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
