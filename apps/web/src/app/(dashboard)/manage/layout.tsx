"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { TenantSelector } from "../../../components/TenantSelector";

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
      <div>
        <Navbar>
          <div>
            <Link href="/">Home</Link> • Tenant:{" "}
            <TenantSelector allowCreate={true} /> •{" "}
            <Link href="/manage/settings">{user?.name || "Profile"}</Link> •{" "}
            <Link href="/manage">Tenant</Link> •{" "}
            <Link href="/contact">Contact</Link> •{" "}
            <a href="/api/auth/logout?returnTo=/">Logout</a>
          </div>
        </Navbar>
        <div>{children}</div>
      </div>
    );
  }

  // User is not logged in - redirect to the login page
  window.location.href = `/api/auth/login?returnTo=${window.location.pathname}${
    window.location.search || ""
  }${window.location.hash || ""}`;

  return <></>;
}
