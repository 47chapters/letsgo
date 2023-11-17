import { AfterRefetch, AppRouteHandlerFn, Session } from "@auth0/nextjs-auth0";
import { serializeIdentity } from "@letsgo/trust";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { apiRequest, getApiUrl } from "../../../../../components/common-server";
import { getAuth0 } from "../../auth0";

/**
 * Save the OpenId profile of the user in the database so that the management portal
 * can display users of the system in a human-readable way.
 */
const saveOpenIdProfile: AfterRefetch = async (
  req: NextRequest,
  session: Session
): Promise<Session> => {
  const accessToken = jwt.decode(session.accessToken || "", { json: true });
  if (accessToken && accessToken.iss && accessToken.sub) {
    const identityId = serializeIdentity({
      iss: accessToken.iss,
      sub: accessToken.sub,
    });
    session.user.identityId = identityId;
    const url = getApiUrl(`/v1/identity/${identityId}`);

    try {
      await apiRequest({
        path: `/v1/identity/${identityId}`,
        method: "PUT",
        body: session.user,
      });
    } catch (e: any) {
      // Best effort
      console.log(`ERROR SAVING USER PROFILE TO ${url}:`, e.message || e);
    }
  }
  return session;
};

// Delay the initialization of the auth handler until the first request is received.
// This is necessary because the auth handler depends on environment variables
// which are only present at runtime (not build time), which breaks the Next.js build.
let handleAuthImpl: AppRouteHandlerFn | undefined = undefined;
const auth: AppRouteHandlerFn = async (req, ctx) => {
  if (!handleAuthImpl) {
    const auth0 = getAuth0();
    handleAuthImpl = auth0.handleAuth({
      profile: auth0.handleProfile({
        refetch: true,
        afterRefetch: saveOpenIdProfile,
      }),
    }) as AppRouteHandlerFn;
  }
  return handleAuthImpl(req, ctx);
};

export const GET = auth;
