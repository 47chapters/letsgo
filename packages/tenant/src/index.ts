/**
 * The package consolidates functions for managing LetsGo tenants, users,
 * and users' memberhips in tenants, including invitations. It also support management of
 * tenant's subscriptions and keeping track of changes in subscription plans.
 *
 * @module
 */

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

/**
 * The _database_ category for items representing LetsGo tenants.
 */
export const TenantCategory = `${VendorPrefix}-tenant`;

/**
 * The _database_ category for items representing a specific user's access to tenants.
 */
export const TenantIdentityCategory = `${VendorPrefix}-tenant-identity`;

/**
 * The _database_ category for items representing a specific tenant's users.
 */
export const IdentityTenantCategory = `${VendorPrefix}-identity-tenant`;

/**
 * The _database_ category for items representing invitations for a specific tenant.
 */
export const InvitationCategory = `${VendorPrefix}-invitation`;

const TenantIdPrefix = "ten";
const InvitationIdPrefix = "inv";

const createTenantId = () => `${TenantIdPrefix}-${uuidv4().replace(/-/g, "")}`;
const createInvitationId = () =>
  `${InvitationIdPrefix}-${uuidv4().replace(/-/g, "")}`;

/**
 * A change in a tenant's subscription plan.
 */
export interface SubscriptionPlanChange {
  /**
   * The timestamp of the change.
   */
  timestamp: string;
  /**
   * The identity of the user who made the change.
   */
  updatedBy: Identity;
  /**
   * The new plan ID the tenant switched to.
   */
  newPlanId: string | null;
}

/**
 * A tenant's subscription plan.
 */
export interface SubscriptionPlan {
  /**
   * The plan ID.
   */
  planId: string;
  /**
   * The Stripe customer ID associated with the tenant. Once established, the Stripe customer Id remains unchanged even
   * if the tenant's Stripe subscription is canceled and later reactivated.
   */
  stripeCustomerId?: string;
  /**
   * The tenant's Stripe subscription. This is undefined if the tenant has no Stripe subscription (e.g. is on an unpaid plan
   * or a custom plan handled outside of Stripe's realm).
   */
  stripeSubscription?: {
    /**
     * The Stripe subscription ID.
     */
    subscriptionId: string;
    /**
     * The subscription status.
     */
    status: string;
    /**
     * The timestamp of the end of the current billing period.
     */
    currentPeriodEnd: string;
    /**
     * The tenant's credit card on file.
     */
    card?: CardInfo;
  };
  /**
   * History of changes of the tenant's subscription plan.
   */
  changes: SubscriptionPlanChange[];
}

/**
 * A LetsGo tenant.
 */
export interface Tenant extends DBItem {
  /**
   * The tenant ID. This is unique in the system.
   */
  tenantId: string;
  /**
   * The tenant's display name. This does not need to be unique in the system.
   */
  displayName: string;
  /**
   * The timestamp of the tenant's creation.
   */
  createdAt: string;
  /**
   * The identity of the user who created the tenant.
   */
  createdBy: Identity;
  /**
   * The timestamp of the last update to the tenant.
   */
  updatedAt: string;
  /**
   * The identity of the user who last updated the tenant.
   */
  updatedBy: Identity;
  /**
   * The timestamp of the tenant's deletion. If this is undefined, the tenant is not deleted. If it is present,
   * the tenant is considered non-exitent in the UX of the end user.
   */
  deletedAt?: string;
  /**
   * The identity of the user who deleted the tenant.
   */
  deletedBy?: Identity;
  /**
   * The tenant's subscription plan. A tenant is _always_ associated with a subscription plan, even if it is a free plan.
   */
  plan: SubscriptionPlan;
}

/**
 * An invitation for a new user to join a tenant.
 */
export interface Invitation extends DBItem {
  /**
   * The invitation ID. This is unique within a tenant.
   */
  invitationId: string;
  /**
   * The identity of the user who created the invitation.
   */
  createdBy: Identity;
  /**
   * The timestamp of the invitation's creation.
   */
  createdAt: string;
  /**
   * The timestamp of the invitation's expiration.
   */
  expiresAt: string;
  /**
   * The time-to-live of the invitation in seconds.
   */
  ttl: number;
}

/**
 * @ignore
 */
export function serializeInvitationKey(tenantId: string, invitationId: string) {
  return `/${tenantId}/${invitationId}`;
}

/**
 * @ignore
 */
export function serializeTenantIdentityIdKey(
  tenantId: string,
  identityId: string
) {
  return `/${tenantId}/${identityId}`;
}

/**
 * @ignore
 */
export function serializeTenantIdentityKey(
  tenantId: string,
  identity: Identity
) {
  return `/${tenantId}/${serializeIdentity(identity)}`;
}

/**
 * @ignore
 */
export function deserializeTenantIdentityKey(key: string): [string, Identity] {
  const [_, tenantId, identity] = key.split("/");
  return [tenantId, deserializeIdentity(identity)];
}

/**
 * @ignore
 */
export function serializeIdentityTenantKey(
  identity: Identity,
  tenantId: string
) {
  return `/${serializeIdentity(identity)}/${tenantId}`;
}

/**
 * @ignore
 */
export function deserializeIdentityTenantKey(key: string): [Identity, string] {
  const [_, identity, tenantId] = key.split("/");
  return [deserializeIdentity(identity), tenantId];
}

/**
 * Update the tenant with a new plan ID and record the change.
 * @param tenant The tenant to update.
 * @param planId The new plan ID.
 * @param identity The identity of the user who made the change.
 */
export function setNewPlan(tenant: Tenant, planId: string, identity: Identity) {
  tenant.plan.planId = planId;
  tenant.plan.changes.push({
    timestamp: new Date().toISOString(),
    updatedBy: identity,
    newPlanId: planId,
  });
}

/**
 * Options for creating an invitation to join a tenant.
 */
export interface CreateInvitationOptions extends DeploymentOptions {
  /**
   * The identity of the user who is creating the invitation.
   */
  createdBy: Identity;
  /**
   * The tenant ID the invitation relates to.
   */
  tenantId: string;
  /**
   * The time-to-live of the invitation in seconds.
   */
  ttl: number;
}

/**
 * Update the status of the Stripe subscription for a LetsGo tenant based on the source of truth in Stripe.
 * @param tenant LetsGo tenant to update the subscription status for.
 * @param identity The idenantity of the user who triggered the update.
 * @returns The updated tenant if the subscription status changed, undefined if there were no changes in status.
 */
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

/**
 * Create an invitation to join a tenant.
 * @param options Options for creating the invitation.
 * @returns New invitation
 */
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

/**
 * Options for getting an existing invitation.
 */
export interface GetInvitationOptions extends DeploymentOptions {
  /**
   * The tenant ID the invitation relates to.
   */
  tenantId: string;
  /**
   * The invitation ID.
   */
  invitationId: string;
}

/**
 * Gets an existing invitation to join a tenant.
 * @param options Options for getting the invitation.
 * @returns The invitation if it exists and has not expired, undefined otherwise.
 */
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

/**
 * Options for deleting an existing invitation.
 */
export interface DeleteInvitationOptions extends DeploymentOptions {
  /**
   * The tenant ID the invitation relates to.
   */
  tenantId: string;
  /**
   * The invitation ID.
   */
  invitationId: string;
}

/**
 * Revoke an inviation to join a tenant.
 * @param options Options for deleting the invitation.
 */
export async function deleteInvitation(
  options: DeleteInvitationOptions
): Promise<void> {
  const result = await deleteItem(
    InvitationCategory,
    serializeInvitationKey(options.tenantId, options.invitationId),
    options
  );
}

/**
 * Options for getting all invitations for a given tenant.
 */
export interface GetInvitationsOptions extends DeploymentOptions {
  /**
   * The tenant ID the invitations relate to.
   */
  tenantId: string;
}

/**
 * Returns all active, non-expired invitations for a given tenant.
 * @param options Options for getting the invitations.
 * @returns Array of active invitations.
 */
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

/**
 * Options for creating a new tenants.
 */
export interface CreateTenantOptions extends DeploymentOptions {
  /**
   * The identity of the user who is creating the tenant.
   */
  createdBy: Identity;
  /**
   * The tenant's display name. If not specified, a random display name is generated.
   */
  displayName?: string;
}

/**
 * Creates a new tenant. The new tenant has a unique ID and is associated with the `DefaultPlanId`
 * subscription plan defined in the @letsgo/pricing package.
 * @param options Options for creating the tenant.
 * @returns The newly created tenant.
 */
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

/**
 * Options for getting an existing tenant.
 */
export interface GetTenantOptions extends DeploymentOptions {
  /**
   * The ID of the tenant to get.
   */
  tenantId: string;
  /**
   * If true, the tenant is returned even if it is deleted (i.e. it's `deletedAt` property is set)
   */
  includeDeleted?: boolean;
}

/**
 * Get an existing tenant. If the tenant is deleted, it is returned only if `options.includeDeleted` is true.
 * @param options Options for getting the tenant.
 * @returns The tenant if it exists and is not deleted, undefined otherwise.
 */
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

/**
 * Options for updating an existing tenant.
 */
export interface PutTenantOptions extends DeploymentOptions {
  /**
   * The ID of the tenant to update.
   */
  tenantId: string;
  /**
   * The tenant's display name. If not specified, the existing display name is used.
   */
  displayName?: string;
  /**
   * The identity of the user who is updating the tenant.
   */
  updatedBy: Identity;
  /**
   * The tenant's updated subscription plan. If not specified, the existing plan is used.
   */
  plan?: SubscriptionPlan;
}

/**
 * Update a tenant.
 * @param options Options for updating the tenant.
 * @returns The updated tenant.
 */
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

/**
 * Options for deleting an existing tenant.
 */
export interface DeleteTenantOptions extends DeploymentOptions {
  /**
   * The ID of the tenant to delete.
   */
  tenantId: string;
  /**
   * The identity of the user who is deleting the tenant.
   */
  deletedBy: Identity;
}

/**
 * Deletes a tenant. No data is removed from the database, but the tenant is marked as deleted.
 * @param options Options for deleting the tenant.
 * @returns The deleted tenant, or undefined if the tenant was alrady deleted or does not exist.
 */
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

/**
 * Options for getting all tenants a specific user has access to.
 */
export interface GetTenantsOfIdentityOptions extends DeploymentOptions {
  /**
   * The identity of the user whose tenants are to be returned.
   */
  identity: Identity;
  /**
   * If true, the result includes tenants that have been deleted.
   */
  includeDeleted?: boolean;
}

/**
 * Get tenants a specific user has access to.
 * @param options Options for getting the tenants.
 * @returns Array of tenants the user has access to.
 */
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

/**
 * Options for getting all users of a specific tenant.
 */
export interface GetIdentitiesOfTenantOptions extends DeploymentOptions {
  /**
   * The Id of the tenant whose users are to be returned.
   */
  tenantId: string;
}

/**
 * Get users who are members of a specific tenant.
 * @param options Options for getting the users.
 * @returns Array of users who are members of the tenant.
 */
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

/**
 * Options for checking if a user is a member of a tenant.
 */
export interface IsIdentityInTenantOptions extends DeploymentOptions {
  /**
   * LetsGo tenant Id.
   */
  tenantId: string;
  /**
   * LetsGo identity Id.
   */
  identityId: string;
}

/**
 * Checks if a user is a member of a tenant.
 * @param options Options for checking the membership.
 * @returns True if the user is member of the tenant, false otherwise.
 */
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

/**
 * Options for adding a new user to a tenant.
 */
export interface AddIdentityToTenantOptions extends DeploymentOptions {
  /**
   * LetsGo tenant Id.
   */
  tenantId: string;
  /**
   * LetsGo identity.
   */
  identity: Identity;
}

/**
 * Adds a new user to a tenant.
 * @param options Options for adding the user.
 */
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

/**
 * Options for removing a user from a tenant.
 */
export interface RemoveIdentityFromTenantOptions extends DeploymentOptions {
  /**
   * LetsGo tenant Id.
   */
  tenantId: string;
  /**
   * LetsGo identity.
   */
  identity: Identity;
}

/**
 * Removes a user from a tenant.
 * @param options Options for removing the user.
 */
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
