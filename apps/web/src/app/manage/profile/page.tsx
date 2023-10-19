import { getAccessToken } from "@auth0/nextjs-auth0";
import { Suspense } from "react";

async function Me() {
  const { accessToken } = await getAccessToken();

  const url = `${process.env["LETSGO_API_URL"]}/v1/me`;
  const authorization = `Bearer ${accessToken}`;
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

  return (
    <div>
      <pre>{JSON.stringify(me, null, 2)}</pre>
    </div>
  );
}

export default async function Profile() {
  return (
    <div>
      <p>Your identity:</p>
      {/* @ts-expect-error Server Component */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* @ts-expect-error Server Component */}
        <Me />
      </Suspense>
    </div>
  );
}

export const dynamic = "force-dynamic";
