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
