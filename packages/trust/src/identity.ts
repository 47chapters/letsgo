import { VendorPrefix } from "@letsgo/constants";
import {
  getItem,
  putItem,
  DeploymentOptions,
  DBItem,
  deleteItem,
} from "@letsgo/db";
import { Identity, serializeIdentity } from ".";

const IdentityCategory = `${VendorPrefix}-identity`;

/**
 * Claims are the user attributes that are stored in the database. They correspond to the claims in the ID token
 * describing the user.
 */
export interface Claims {
  [key: string]: any;
}

/**
 * Options for getting or deleting an identity from the database. Either `identityId` or `identity` must be provided.
 */
export interface IdentityOptions extends DeploymentOptions {
  /**
   * The serialized identityId of the user.
   */
  identityId?: string;
  /**
   * The deserialized identity of the user.
   */
  identity?: Identity;
}

/**
 * Options for upserting an identity to the database.
 */
export interface PutIdentityOptions extends IdentityOptions {
  /**
   * Claims describing the user.
   */
  user: Claims;
}

/**
 * Upserts an identity to the database. Identities are stored in the `letsgo-identity` category.
 * @param options Options for upserting the identity.
 */
export async function putIdentity(options: PutIdentityOptions): Promise<void> {
  if (!options.identity && !options.identityId) {
    throw new Error(`Either identity or identityId must be provided`);
  }
  await putItem(
    {
      category: IdentityCategory,
      key:
        options.identityId || serializeIdentity(options.identity as Identity),
      user: options.user,
      updatedAt: new Date().toISOString(),
    },
    options
  );
}

/**
 * The result of getting an identity from the database.
 */
export interface GetIdentityResult extends DBItem {
  /**
   * The serialized identityId of the user.
   */
  identityId: string;
  /**
   * Claims describing the user.
   */
  user: Claims;
  /**
   * The timestamp of the last update to the identity.
   */
  updatedAt: string;
}

/**
 * Gets an identity from the database. Identities are stored in the `letsgo-identity` category.
 * @param options Options for getting the identity.
 * @returns The identity result or undefined if the identity does not exist.
 */
export async function getIdentity(
  options: IdentityOptions
): Promise<GetIdentityResult | undefined> {
  if (!options.identity && !options.identityId) {
    throw new Error(`Either identity or identityId must be provided`);
  }
  const identityId =
    options.identityId || serializeIdentity(options.identity as Identity);
  const result = await getItem(IdentityCategory, identityId, options);
  return result ? ({ ...result, identityId } as GetIdentityResult) : undefined;
}

/**
 * Deletes an identity from the database. Identities are stored in the `letsgo-identity` category.
 * @param options Options for deleting the identity.
 */
export async function deleteIdentity(options: IdentityOptions): Promise<void> {
  if (!options.identity && !options.identityId) {
    throw new Error(`Either identity or identityId must be provided`);
  }
  const identityId =
    options.identityId || serializeIdentity(options.identity as Identity);
  await deleteItem(IdentityCategory, identityId, options);
}
