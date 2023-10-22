import {
  AfterCallback,
  Session,
  handleAuth,
  handleCallback,
} from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";

/**
 * Aftet the OAuth callback has processed, call the API server's GET /v1/me endpoint with the accessToken
 * of the authenticated user to get the user's tenancy information and add it to the user profile in the session.
 */
const enhanceSessionWithTenancyInformation: AfterCallback = async (
  req: NextRequest,
  session: Session
): Promise<Session> => {
  const accessToken = session.accessToken;
  const url = `${process.env["LETSGO_API_URL"]}/v1/me`;
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
