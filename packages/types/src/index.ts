/**
 * The package contains types that are shared between LetsGo client and server components.
 *
 * @module
 */

import { Invitation, Tenant } from "@letsgo/tenant";
import { Identity } from "@letsgo/trust";

/**
 * All users with permissions to access a tenant.
 */
export interface GetTenantUsersResponse {
  /**
   * Array of identities represeting users with access to the tenant.
   */
  identities: {
    /**
     * Serialized identityId of the user.
     */
    identityId: string;
    /**
     * The `iss` claim from the access token of the user, identifying the issuer of the token.
     */
    iss: string;
    /**
     * The `sub` claim from the access token of the user.
     */
    sub: string;
    /**
     * The claims from the user profile.
     */
    user?: {
      /**
       * The `sub` claim from the access token of the user.
       */
      sub?: string;
      /**
       * Indicates whether the user's email address has been verified.
       */
      email_verified?: boolean;
      /**
       * Display name of the user.
       */
      name?: string;
      /**
       * Nickname of the user.
       */
      nickname?: string;
      /**
       * Given name of the user.
       */
      given_name?: string;
      /**
       * User's primary locale.
       */
      locale?: string;
      /**
       * Family name of the user.
       */
      family_name?: string;
      /**
       * URL of the user's profile picture.
       */
      picture?: string;
      /**
       * Email address of the user. The email had been verified if {@link email_verified} is true.
       */
      email?: string;
      /**
       * The `sid` claim from the access token of the user.
       */
      sid?: string;
      /**
       * Other claims from the user profile.
       */
      [key: string]: any;
    };
  }[];
}

/**
 * All active invitations to a tenant.
 */
export interface GetInvitationsResponse {
  /**
   * Active invitations to the tenant.
   */
  invitations: Invitation[];
}

/**
 * Details of the user represented by an access token. This includes the identity of the user as well
 * as the list of tenants that user has access to.
 */
export interface GetMeResponse {
  /**
   * Serialized identityId of the user.
   */
  identityId: string;
  /**
   * Deserialized identity of the user.
   */
  identity: Identity;
  /**
   * List of tenants that the user has access to.
   */
  tenants: Tenant[];
}

/**
 * Request to switch a teant to a new plan.
 */
export interface PostPlanRequest {
  /**
   * The ID of the plan to switch the tenant to.
   */
  planId: string;
  /**
   * If a new Stripe customer needs to be created, this is their email address.
   */
  email?: string;
  /**
   * If a new Stripe customer needs to be created, this is their name.
   */
  name?: string;
}

/**
 * Response to a request to switch a tenant to a new plan. This response is only generated if the new plan
 * requires a new payment method from Stripe.
 */
export interface PostPlanResponse {
  /**
   * Stripe subscrption Id.
   */
  subscriptionId: string;
  /**
   * Stripe client secret to continue processing a new payment intent.
   */
  clientSecret: string;
  /**
   * Stripe public key.
   */
  publicKey: string;
}

/**
 * Response to a request to update a Stripe payment method on a subscription.
 */
export interface PostPaymentMethodResponse {
  /**
   * Stripe client secret to continue processing a new setup intent.
   */
  clientSecret: string;
  /**
   * Stripe public key.
   */
  publicKey: string;
}

/**
 * Message types recognized by the _worker_ component.
 */
export enum MessageType {
  /**
   * Submission of the contact form.
   */
  Contact = "letsgo:contact",
  /**
   * Stripe webhook event.
   */
  Stripe = "letsgo:stripe",
  /**
   * New LetsGo tenant created.
   */
  TenantNew = "letsgo:tenant:new",
  /**
   * LetsGo tenant deleted.
   */
  TenantDeleted = "letsgo:tenant:deleted",
}

/**
 * A message sent to the _worker_ component.
 */
export interface Message {
  /**
   * Message type.
   */
  type: MessageType | string;
  /**
   * Message payload.
   */
  payload: any;
}

/**
 * Payload of a message of {@link MessageType.Contact} type representing the contact form submission.
 */
export interface ContactMessagePayload {
  /**
   * Email address of the sender.
   */
  email: string;
  /**
   * Name of the sender.
   */
  name: string;
  /**
   * Message provided by the sender.
   */
  message: string;
  /**
   * Timestamp of the submission.
   */
  timestamp: string;
  /**
   * Query parameters of the page where the contact form was submitted.
   */
  query: {
    [key: string]: string;
  };
  /**
   * Current tenant Id if one was present in the context where the contact form was submitted from.
   */
  tenantId?: string;
  /**
   * Identity Id of the logged in user when the form was submitted.
   */
  identityId?: string;
}

/**
 * Message of {@link MessageType.Contact} type representing the contact form submission.
 */
export interface ContactMessage extends Message {
  /**
   * Message type.
   */
  type: MessageType.Contact;
  /**
   * Message payload.
   */
  payload: ContactMessagePayload;
}

/**
 * Payload of a message of {@link MessageType.TenantNew} type representing the creation of a new tenant.
 */
export interface TenantNewMessagePayload {
  /**
   * The newly created tenant.
   */
  tenant: Tenant;
}

/**
 * Message of {@link MessageType.TenantNew} type representing the creation of a new tenant.
 */

export interface TenantNewMessage extends Message {
  /**
   * Message type.
   */
  type: MessageType.TenantNew;
  /**
   * Message payload.
   */
  payload: TenantNewMessagePayload;
}

/**
 * Payload of a message of {@link MessageType.TenantDeleted} type representing the deletion of a new tenant.
 */
export interface TenantDeletedMessagePayload {
  /**
   * The deleted tenant.
   */
  tenant: Tenant;
  /**
   * The ID of the plan the tenant was on when it was deleted.
   */
  cancelledPlanId: string;
}

/**
 * Message of {@link MessageType.TenantDeleted} type representing the deletion of a new tenant.
 */
export interface TenantDeletedMessage extends Message {
  /**
   * Message type.
   */
  type: MessageType.TenantDeleted;
  /**
   * Message payload.
   */
  payload: TenantDeletedMessagePayload;
}

/**
 * Message of {@link MessageType.Stripe} type representing the Stripe webhook event.
 */

export interface StripeMessage extends Message {
  /**
   * Message type.
   */
  type: MessageType.Stripe;
  /**
   * Stripe event
   */
  payload: {
    /**
     * Stripe event type
     */
    type: string;
    /**
     * Other event properties.
     */
    [key: string]: any;
  };
}
