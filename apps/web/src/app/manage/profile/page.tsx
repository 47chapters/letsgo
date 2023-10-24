import {
  withPageAuthRequired,
  getAccessToken,
  getSession,
} from "@auth0/nextjs-auth0";
import { Suspense } from "react";
import { getApiUrl } from "../../../components/common";

async function Me() {
  const { accessToken } = await getAccessToken();
  const url = getApiUrl(`/v1/me`);
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

async function User() {
  const session = await getSession();
  return (
    <div>
      <pre>{JSON.stringify(session?.user, null, 2)}</pre>
    </div>
  );
}

export default withPageAuthRequired(
  async function Profile() {
    return (
      <div>
        <p>Response from HTTP GET {getApiUrl(`/v1/me`)}:</p>
        {/* @ts-expect-error Server Component */}
        <Suspense fallback={<div>Loading...</div>}>
          {/* @ts-expect-error Server Component */}
          <Me />
        </Suspense>
        <p>Logged in user profile:</p>
        {/* @ts-expect-error Server Component */}
        <Suspense fallback={<div>Loading...</div>}>
          {/* @ts-expect-error Server Component */}
          <User />
        </Suspense>
      </div>
    );
  },
  { returnTo: "/manage/profile" }
);

export const dynamic = "force-dynamic";
