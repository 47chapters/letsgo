"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (user) {
    return (
      <div>
        <div>
          Welcome {user.name}! <a href="/api/auth/logout">Logout</a>
        </div>
        <div>{children}</div>
      </div>
    );
  }

  return (
    <a
      href={`/api/auth/login?returnTo=${window.location.pathname}${
        window.location.search || ""
      }${window.location.hash || ""}`}
    >
      Login
    </a>
  );
}
