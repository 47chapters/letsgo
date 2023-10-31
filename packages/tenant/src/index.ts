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
import {
  uniqueNamesGenerator,
  colors,
  animals,
  Config,
} from "unique-names-generator";
import { DefaultPlanId } from "@letsgo/pricing";
import { getSubscription, CardInfo } from "@letsgo/stripe";

const nameGeneratorConfig: Config = {
  dictionaries: [colors, animals],
  separator: " ",
  style: "capital",
  length: 2,
};

export const TenantCategory = `${VendorPrefix}-tenant`;
export const TenantIdentityCategory = `${VendorPrefix}-tenant-identity`;
export const IdentityTenantCategory = `${VendorPrefix}-identity-tenant`;
export const InvitationCategory = `${VendorPrefix}-invitation`;
const TenantIdPrefix = "ten";
const InvitationIdPrefix = "inv";

const createTenantId = () => `${TenantIdPrefix}-${uuidv4().replace(/-/g, "")}`;
const createInvitationId = () =>
  `${InvitationIdPrefix}-${uuidv4().replace(/-/g, "")}`;

export interface SubscriptionPlanChange {
  timestamp: string;
  updatedBy: Identity;
  newPlanId: string | null;
}

export interface SubscriptionPlan {
  planId: string;
  stripeCustomerId?: string;
  stripeSubscription?: {
    subscriptionId: string;
    status: string;
    currentPeriodEnd: string;
    card?: CardInfo;
  };
  changes: SubscriptionPlanChange[];
}

export interface Tenant extends DBItem {
  tenantId: string;
  displayName: string;
  createdAt: string;
  createdBy: Identity;
  updatedAt: string;
  updatedBy: Identity;
  deletedAt?: string;
  deletedBy?: Identity;
  plan: SubscriptionPlan;
}

export interface Invitation extends DBItem {
  invitationId: string;
  createdBy: Identity;
  createdAt: string;
  expiresAt: string;
  ttl: number;
}

export function serializeInvitationKey(tenantId: string, invitationId: string) {
  return `/${tenantId}/${invitationId}`;
}

export function serializeTenantIdentityIdKey(
  tenantId: string,
  identityId: string
) {
  return `/${tenantId}/${identityId}`;
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

export function deserializeIdentityTenantKey(key: string): [Identity, string] {
  const [_, identity, tenantId] = key.split("/");
  return [deserializeIdentity(identity), tenantId];
}

export function setNewPlan(tenant: Tenant, planId: string, identity: Identity) {
  tenant.plan.planId = planId;
  tenant.plan.changes.push({
    timestamp: new Date().toISOString(),
    updatedBy: identity,
    newPlanId: planId,
  });
}

export interface CreateInvitationOptions extends DeploymentOptions {
  createdBy: Identity;
  tenantId: string;
  ttl: number;
}

export async function reconcileSubscriptionStatus(
  tenant: Tenant,
  identity: Identity
): Promise<Tenant | undefined> {
  if (tenant.plan.stripeSubscription) {
    const subscription = await getSubscription(
      tenant.plan.stripeSubscription.subscriptionId
    );
    if (
      !subscription ||
      ((tenant.plan.stripeSubscription.status !== subscription.status ||
        tenant.plan.planId !== subscription.planId ||
        tenant.plan.stripeSubscription.card?.last4 !==
          subscription.card?.last4 ||
        tenant.plan.stripeSubscription.card?.brand !==
          subscription.card?.brand) &&
        subscription.status !== "incomplete")
    ) {
      const newTenant = { ...tenant };
      if (
        !subscription ||
        subscription.status === "canceled" ||
        subscription.status === "incomplete_expired"
      ) {
        newTenant.plan.stripeSubscription = undefined;
        setNewPlan(newTenant, DefaultPlanId, identity);
      } else {
        newTenant.plan.stripeSubscription = {
          subscriptionId: tenant.plan.stripeSubscription.subscriptionId,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          card: subscription.card,
        };
        setNewPlan(newTenant, subscription.planId, identity);
      }
      return newTenant;
    }
  }
  return undefined;
}

export async function createInvitation(
  options: CreateInvitationOptions
): Promise<Invitation> {
  const invitationId = createInvitationId();
  const invitation: Invitation = {
    category: InvitationCategory,
    key: serializeInvitationKey(options.tenantId, invitationId),
    invitationId,
    ttl: options.ttl,
    createdAt: new Date().toISOString(),
    createdBy: options.createdBy,
    expiresAt: new Date(options.ttl * 1000).toISOString(),
  };
  await putItem(invitation, options);
  return invitation;
}

export interface GetInvitationOptions extends DeploymentOptions {
  tenantId: string;
  invitationId: string;
}

export async function getInvitation(
  options: GetInvitationOptions
): Promise<Invitation | undefined> {
  const result = await getItem<Invitation>(
    InvitationCategory,
    serializeInvitationKey(options.tenantId, options.invitationId),
    options
  );
  return result;
}

export interface DeleteInvitationOptions extends DeploymentOptions {
  tenantId: string;
  invitationId: string;
}

export async function deleteInvitation(
  options: DeleteInvitationOptions
): Promise<void> {
  const result = await deleteItem(
    InvitationCategory,
    serializeInvitationKey(options.tenantId, options.invitationId),
    options
  );
}

export interface GetInvitationsOptions extends DeploymentOptions {
  tenantId: string;
}

export async function getInvitations(
  options: GetInvitationsOptions
): Promise<Invitation[]> {
  let invitations: Invitation[] = [];
  let nextToken: string | undefined;
  do {
    const result = await listItems(
      InvitationCategory,
      `/${options.tenantId}/`,
      { ...options, nextToken }
    );
    invitations = invitations.concat(result.items as Invitation[]);
    nextToken = result.nextToken;
  } while (nextToken);
  return invitations;
}

export interface CreateTenantOptions extends DeploymentOptions {
  createdBy: Identity;
  displayName?: string;
}

export async function createTenant(
  options: CreateTenantOptions
): Promise<Tenant> {
  const tenantId = createTenantId();
  const tenant: Tenant = {
    category: TenantCategory,
    key: tenantId,
    tenantId,
    displayName:
      options.displayName || uniqueNamesGenerator(nameGeneratorConfig),
    createdAt: new Date().toISOString(),
    createdBy: options.createdBy,
    updatedAt: new Date().toISOString(),
    updatedBy: options.createdBy,
    plan: {
      planId: DefaultPlanId,
      changes: [
        {
          timestamp: new Date().toISOString(),
          updatedBy: options.createdBy,
          newPlanId: DefaultPlanId,
        },
      ],
    },
  };
  await putItem(tenant, options);
  await putItem({
    category: TenantIdentityCategory,
    key: serializeTenantIdentityKey(tenantId, options.createdBy),
  });
  await putItem({
    category: IdentityTenantCategory,
    key: serializeIdentityTenantKey(options.createdBy, tenantId),
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
  plan?: SubscriptionPlan;
}

export async function putTenant(options: PutTenantOptions): Promise<Tenant> {
  const existing = await getTenant({ ...options, includeDeleted: true });
  if (!existing) {
    throw new Error(`Tenant ${options.tenantId} not found`);
  }
  const updated = {
    ...existing,
    displayName: options.displayName || existing.displayName,
    plan: options.plan || existing.plan,
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

export interface IsIdentityInTenantOptions extends DeploymentOptions {
  tenantId: string;
  identityId: string;
}

export async function isIdentityInTenant(
  options: IsIdentityInTenantOptions
): Promise<boolean> {
  const result = await getItem(
    TenantIdentityCategory,
    serializeTenantIdentityIdKey(options.tenantId, options.identityId),
    options
  );
  return !!result;
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
