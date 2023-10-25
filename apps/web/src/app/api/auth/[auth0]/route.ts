import {
  AfterRefetch,
  Session,
  handleAuth,
  handleProfile,
} from "@auth0/nextjs-auth0";
import { serializeIdentity } from "@letsgo/trust";
import { NextRequest } from "next/server";
import { apiRequest, getApiUrl } from "../../../../components/common-server";
import jwt from "jsonwebtoken";

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

export const GET = handleAuth({
  profile: handleProfile({
    refetch: true,
    afterRefetch: saveOpenIdProfile,
  }),
});
