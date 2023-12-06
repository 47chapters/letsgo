"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { TenantProvider } from "components/TenantProvider";

export default function AcceptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) throw error;
  if (user) {
    return (
      <TenantProvider noTenantProvisioning={true}>
        <div>{children}</div>
      </TenantProvider>
    );
  }

  window.location.href = `/api/auth/login?returnTo=${window.location.pathname}${
    window.location.search || ""
  }${window.location.hash || ""}`;

  return <div></div>;
}
