import {
  AfterCallback,
  AfterRefetch,
  Session,
  handleAuth,
  handleCallback,
  handleProfile,
} from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";
import { sortTenants } from "../../../../components/common";
import { getApiUrl, apiRequest } from "../../../../components/common-server";
import { Tenant } from "@letsgo/tenant";
import { serializeIdentity } from "@letsgo/trust";

/**
 * Aftet the OAuth callback has processed, call the API server's GET /v1/me endpoint with the accessToken
 * of the authenticated user to get the user's tenancy information and add it to the user profile in the session.
 */
const enhanceSessionWithTenancyInformation: AfterCallback = async (
  req: NextRequest,
  session: Session
): Promise<Session> => {
  try {
    const me = await apiRequest({
      path: "/v1/me",
      accessToken: session.accessToken,
    });
    session.user = { ...session.user, ...me };
    if (session.user.tenants) {
      session.user.tenants = sortTenants(session.user.tenants as Tenant[]);
    }
  } catch (e: any) {
    console.log(
      `ERROR GETTING TENANT INFORMATION FOR LOGGED IN USER FROM ${getApiUrl(
        "/v1/me"
      )}:`,
      e.message || e
    );
  }
  return session;
};

/**
 * Save the OpenId profile of the user in the database so that the management portal
 * can display users of the system in a human-readable way.
 */
const saveOpenIdProfile: AfterRefetch = async (
  req: NextRequest,
  session: Session
): Promise<Session> => {
  const identityId = serializeIdentity(session.user.identity);
  const url = getApiUrl(`/v1/identity/${identityId}`);

  try {
    const profile = { ...session.user };
    delete profile.identity;
    delete profile.tenants;
    delete profile.identityId;
    await apiRequest({
      path: `/v1/identity/${identityId}`,
      method: "PUT",
      body: profile,
      noResponse: true,
    });
  } catch (e: any) {
    // Best effort
    console.log(`ERROR SAVING USER PROFILE TO ${url}:`, e.message || e);
  }
  return session;
};

export const GET = handleAuth({
  callback: handleCallback({
    afterCallback: enhanceSessionWithTenancyInformation,
  }),
  profile: handleProfile({
    refetch: true,
    afterRefetch: saveOpenIdProfile,
  }),
});
