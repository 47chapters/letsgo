import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Suspense } from "react";
import { getApiUrl, apiRequest } from "../../../components/common-server";

async function Me() {
  const me = await apiRequest({
    path: `/v1/me`,
  });

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
        <p>Your user profile:</p>
        {/* @ts-expect-error Server Component */}
        <Suspense fallback={<div>Loading...</div>}>
          {/* @ts-expect-error Server Component */}
          <User />
        </Suspense>
        <p>Response from HTTP GET {getApiUrl(`/v1/me`)}:</p>
        {/* @ts-expect-error Server Component */}
        <Suspense fallback={<div>Loading...</div>}>
          {/* @ts-expect-error Server Component */}
          <Me />
        </Suspense>
      </div>
    );
  },
  { returnTo: "/manage/profile" }
);

export const dynamic = "force-dynamic";
