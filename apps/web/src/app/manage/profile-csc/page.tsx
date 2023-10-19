"use client";

import useSWR from "swr";

function Me() {
  /**
   * Use the /api/proxy proxy route of the Next.js web app to proxy the request to /v1/me API of the API server.
   * The proxy route will add the authorization header with the access token of the currently logged in user
   * on the server side of the Next.js app, so there is no need to specify the access token here.
   */
  const { isLoading, error, data } = useSWR("/api/proxy/v1/me", async (url) => {
    const result = await fetch(url);

    if (!result.ok) {
      throw new Error(
        `Failed to fetch ${url}: HTTP ${result.status} ${result.statusText}`
      );
    }

    return result.json();
  });

  if (error) {
    throw error;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default function Profile() {
  return (
    <div>
      <p>Your identity:</p>
      <Me />
    </div>
  );
}
