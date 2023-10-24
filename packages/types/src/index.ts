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
