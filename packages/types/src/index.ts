import { Invitation, Tenant } from "@letsgo/tenant";
import { Identity } from "@letsgo/trust";

export interface GetTenantUsersResponse {
  identities: {
    identityId: string;
    iss: string;
    sub: string;
    user?: {
      sub?: string;
      email_verified?: boolean;
      name?: string;
      nickname?: string;
      given_name?: string;
      locale?: string;
      family_name?: string;
      picture?: string;
      email?: string;
      sid?: string;
      [key: string]: any;
    };
  }[];
}

export interface GetInvitationsResponse {
  invitations: Invitation[];
}

export interface GetMeResponse {
  identityId: string;
  identity: Identity;
  tenants: Tenant[];
}

export interface PostPlanRequest {
  planId: string;
  email?: string;
  name?: string;
}

export interface PostPlanResponse {
  subscriptionId: string;
  clientSecret: string;
  publicKey: string;
}

export interface PostPaymentMethodResponse {
  clientSecret: string;
  publicKey: string;
}

export enum MessageType {
  Contact = "letsgo:contact", // Contact form submission
  Stripe = "letsgo:stripe", // Stripe webhook
  TenantNew = "letsgo:tenant:new", // New tenant created
  TenantDeleted = "letsgo:tenant:deleted", // Tenant deleted
}

export interface Message {
  type: MessageType | string;
  payload: any;
}

export interface ContactMessagePayload {
  email: string;
  name: string;
  message: string;
  timestamp: string;
  query: {
    [key: string]: string;
  };
  tenantId?: string;
  identityId?: string;
}

export interface ContactMessage extends Message {
  type: MessageType.Contact;
  payload: ContactMessagePayload;
}

export interface TenantNewMessagePayload {
  tenant: Tenant;
}

export interface TenantNewMessage extends Message {
  type: MessageType.TenantNew;
  payload: TenantNewMessagePayload;
}

export interface TenantDeletedMessagePayload {
  tenant: Tenant;
  cancelledPlanId: string;
}

export interface TenantDeletedMessage extends Message {
  type: MessageType.TenantDeleted;
  payload: TenantDeletedMessagePayload;
}

export interface StripeMessage extends Message {
  type: MessageType.Stripe;
  payload: {
    type: string;
    [key: string]: any;
  };
}
