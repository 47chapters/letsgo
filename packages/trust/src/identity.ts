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

interface Claims {
  [key: string]: any;
}

interface PutIdentityOptions extends DeploymentOptions {
  identityId?: string;
  identity?: Identity;
  user: Claims;
}

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

interface GetIdentityOptions extends DeploymentOptions {
  identity?: Identity;
  identityId?: string;
}

interface GetIdentityResult extends DBItem {
  identityId: string;
  user: Claims;
  updatedAt: string;
}

export async function getIdentity(
  options: GetIdentityOptions
): Promise<GetIdentityResult | undefined> {
  if (!options.identity && !options.identityId) {
    throw new Error(`Either identity or identityId must be provided`);
  }
  const identityId =
    options.identityId || serializeIdentity(options.identity as Identity);
  const result = await getItem(IdentityCategory, identityId, options);
  return result ? ({ ...result, identityId } as GetIdentityResult) : undefined;
}

interface DeleteIdentityOptions extends DeploymentOptions {
  identity?: Identity;
  identityId?: string;
}

export async function deleteIdentity(
  options: DeleteIdentityOptions
): Promise<void> {
  if (!options.identity && !options.identityId) {
    throw new Error(`Either identity or identityId must be provided`);
  }
  const identityId =
    options.identityId || serializeIdentity(options.identity as Identity);
  await deleteItem(IdentityCategory, identityId, options);
}
