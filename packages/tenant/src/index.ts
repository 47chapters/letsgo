import { VendorPrefix } from "@letsgo/constants";
import {
  Identity,
  serializeIdentity,
  deserializeIdentity,
} from "@letsgo/trust";
import {
  DBItem,
  DeploymentOptions,
  deleteItem,
  getItem,
  listItems,
  putItem,
} from "@letsgo/db";
import { v4 as uuidv4 } from "uuid";
import { String } from "aws-sdk/clients/acm";

export const TenantCategory = `${VendorPrefix}-tenant`;
export const TenantIdentityCategory = `${VendorPrefix}-tenant-identity`;
export const IdentityTenantCategory = `${VendorPrefix}-identity-tenant`;
const TenantIdPrefix = "ten";

const createTenantId = () => `${TenantIdPrefix}-${uuidv4().replace(/-/g, "")}`;

export interface Tenant extends DBItem {
  tenantId: string;
  displayName: string;
  createdAt: string;
  createdBy: Identity;
  updatedAt: string;
  updatedBy: Identity;
  deletedAt?: string;
  deletedBy?: Identity;
}

export function serializeTenantIdentityKey(
  tenantId: string,
  identity: Identity
) {
  return `/${tenantId}/${serializeIdentity(identity)}`;
}

export function deserializeTenantIdentityKey(key: string): [string, Identity] {
  const [_, tenantId, identity] = key.split("/");
  return [tenantId, deserializeIdentity(identity)];
}

export function serializeIdentityTenantKey(
  identity: Identity,
  tenantId: string
) {
  return `/${serializeIdentity(identity)}/${tenantId}`;
}

export function deserializeIdentityTenantKey(key: string): [Identity, String] {
  const [_, identity, tenantId] = key.split("/");
  return [deserializeIdentity(identity), tenantId];
}

export interface CreateTenantOptions extends DeploymentOptions {
  creator: Identity;
  displayName: string;
}

export async function createTenant(
  options: CreateTenantOptions
): Promise<Tenant> {
  const tenantId = createTenantId();
  const tenant: Tenant = {
    category: TenantCategory,
    key: tenantId,
    tenantId,
    displayName: options.displayName,
    createdAt: new Date().toISOString(),
    createdBy: options.creator,
    updatedAt: new Date().toISOString(),
    updatedBy: options.creator,
  };
  await putItem(tenant, options);
  await putItem({
    category: TenantIdentityCategory,
    key: serializeTenantIdentityKey(tenantId, options.creator),
  });
  await putItem({
    category: IdentityTenantCategory,
    key: serializeIdentityTenantKey(options.creator, tenantId),
  });
  return tenant;
}

export interface GetTenantOptions extends DeploymentOptions {
  tenantId: string;
  includeDeleted?: boolean;
}

export async function getTenant(
  options: GetTenantOptions
): Promise<Tenant | undefined> {
  const result = await getItem<Tenant>(
    TenantCategory,
    options.tenantId,
    options
  );
  return result && result.deletedAt && !options.includeDeleted
    ? undefined
    : result;
}

export interface PutTenantOptions extends DeploymentOptions {
  tenantId: string;
  displayName?: string;
  updatedBy: Identity;
}

export async function putTenant(options: PutTenantOptions): Promise<Tenant> {
  const existing = await getTenant({ ...options, includeDeleted: true });
  if (!existing) {
    throw new Error(`Tenant ${options.tenantId} not found`);
  }
  const updated = {
    ...existing,
    displayName: options.displayName || existing.displayName,
    updatedBy: options.updatedBy,
    updatedAt: new Date().toISOString(),
  };
  await putItem(updated, options);
  return updated;
}

export interface DeleteTenantOptions extends DeploymentOptions {
  tenantId: string;
  deletedBy: Identity;
}

export async function deleteTenant(
  options: DeleteTenantOptions
): Promise<Tenant | undefined> {
  const tenant = await getTenant(options);
  if (tenant) {
    const updated = {
      ...tenant,
      deletedAt: new Date().toISOString(),
      deletedBy: options.deletedBy,
    };
    await putItem(updated, options);
    return updated;
  }
  return undefined;
}

export interface GetTenantsOfIdentityOptions extends DeploymentOptions {
  identity: Identity;
  includeDeleted?: boolean;
}

export async function getTenantsOfIdentity(
  options: GetTenantsOfIdentityOptions
): Promise<Tenant[]> {
  let tenants: Tenant[] = [];
  let nextToken: string | undefined;
  do {
    const result = await listItems(
      IdentityTenantCategory,
      `/${serializeIdentity(options.identity)}/`,
      { ...options, nextToken }
    );
    for (const item of result.items) {
      const tenantId = deserializeIdentityTenantKey(item.key)[1];
      const tenant = await getTenant({ ...options, tenantId: tenantId });
      if (tenant && (!tenant.deletedAt || options.includeDeleted)) {
        tenants.push(tenant);
      }
    }
    nextToken = result.nextToken;
  } while (nextToken);
  return tenants;
}

export interface GetIdentitiesOfTenantOptions extends DeploymentOptions {
  tenantId: string;
}

export async function getIdentitiesOfTenant(
  options: GetIdentitiesOfTenantOptions
): Promise<Identity[]> {
  let identities: Identity[] = [];
  let nextToken: string | undefined;
  do {
    const result = await listItems(
      TenantIdentityCategory,
      `/${options.tenantId}/`,
      {
        ...options,
        nextToken,
      }
    );
    identities = identities.concat(
      result.items.map((item) => deserializeTenantIdentityKey(item.key)[1])
    );
    nextToken = result.nextToken;
  } while (nextToken);
  return identities;
}

export interface AddIdentityToTenantOptions extends DeploymentOptions {
  tenantId: string;
  identity: Identity;
}

export async function addIdentityToTenant(options: AddIdentityToTenantOptions) {
  await putItem({
    category: TenantIdentityCategory,
    key: serializeTenantIdentityKey(options.tenantId, options.identity),
  });
  await putItem({
    category: IdentityTenantCategory,
    key: serializeIdentityTenantKey(options.identity, options.tenantId),
  });
}

export interface RemoveIdentityFromTenantOptions extends DeploymentOptions {
  tenantId: string;
  identity: Identity;
}

export async function removeIdentityFromTenant(
  options: RemoveIdentityFromTenantOptions
) {
  await deleteItem(
    TenantIdentityCategory,
    serializeTenantIdentityKey(options.tenantId, options.identity),
    options
  );
  await deleteItem(
    IdentityTenantCategory,
    serializeIdentityTenantKey(options.identity, options.tenantId),
    options
  );
}
