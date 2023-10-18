// "use client";

// import { useUser } from "@auth0/nextjs-auth0/client";
import { getAccessToken } from "@auth0/nextjs-auth0";

export default async function Profile() {
  // const { user } = useUser();
  const { accessToken } = await getAccessToken();

  return (
    <div>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
      <br></br>
      <pre>{accessToken}</pre>
    </div>
  );
}
