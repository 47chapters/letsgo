"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { TenantSelector } from "../../../components/TenantSelector";
import { TenantProvider } from "../../../components/TenantProvider";
import Link from "next/link";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) throw error;

  if (user) {
    return (
      <TenantProvider>
        <div>
          Welcome {user.name} • Tenant: <TenantSelector allowCreate={true} /> •{" "}
          <Link href="/manage/settings">Profile</Link> •{" "}
          <Link href="/manage">Team</Link> •{" "}
          <a href="/api/auth/logout?returnTo=/">Logout</a>
        </div>
        <div>{children}</div>
      </TenantProvider>
    );
  }

  // User is not logged in - redirect to the login page
  window.location.href = `/api/auth/login?returnTo=${window.location.pathname}${
    window.location.search || ""
  }${window.location.hash || ""}`;

  return <></>;
}
