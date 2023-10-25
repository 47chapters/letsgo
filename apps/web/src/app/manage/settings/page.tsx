"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useApi } from "../../../components/common-client";
import { GetMeResponse } from "@letsgo/types";

function Me() {
  /**
   * Use the /api/proxy proxy route of the Next.js web app to proxy the request to /v1/me API of the API server.
   * The proxy route will add the authorization header with the access token of the currently logged in user
   * on the server side of the Next.js app, so there is no need to specify the access token here.
   */
  const { isLoading, error, data } = useApi<GetMeResponse>({
    path: `/v1/me`,
  });
  if (isLoading) return <div>Loading...</div>;
  if (error) throw error;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function User() {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) throw error;

  return (
    <div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

export default function Profile() {
  return (
    <div>
      <p>Your user profile:</p>
      <User />
      <p>Response from HTTP GET /api/proxy/v1/me:</p>
      <Me />
    </div>
  );
}
