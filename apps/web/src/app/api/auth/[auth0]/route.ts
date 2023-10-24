import {
  AfterCallback,
  Session,
  handleAuth,
  handleCallback,
} from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";
import { getApiUrl, sortTenants } from "../../../../components/common";
import { Tenant } from "@letsgo/tenant";

/**
 * Aftet the OAuth callback has processed, call the API server's GET /v1/me endpoint with the accessToken
 * of the authenticated user to get the user's tenancy information and add it to the user profile in the session.
 */
const enhanceSessionWithTenancyInformation: AfterCallback = async (
  req: NextRequest,
  session: Session
): Promise<Session> => {
  const accessToken = session.accessToken;
  const url = getApiUrl(`/v1/me`);
  const authorization = `Bearer ${accessToken}`;

  try {
    const result = await fetch(url, {
      headers: {
        authorization,
      },
    });

    if (!result.ok) {
      throw new Error(
        `Failed to fetch ${url}: HTTP ${result.status} ${result.statusText}`
      );
    }

    const me = await result.json();
    session.user = { ...session.user, ...me };
    if (session.user.tenants) {
      session.user.tenants = sortTenants(session.user.tenants as Tenant[]);
    }
  } catch (e: any) {
    console.log(
      `ERROR GETTING TENANT INFORMATION FOR LOGGED IN USER FROM ${url}:`,
      e.message || e
    );
  }
  return session;
};

export const GET = handleAuth({
  callback: handleCallback({
    afterCallback: enhanceSessionWithTenancyInformation,
  }),
});
