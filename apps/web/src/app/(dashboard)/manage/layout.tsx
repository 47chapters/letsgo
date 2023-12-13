"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { LoadingPlaceholder } from "components/LoadingPlaceholder";
import { SidebarNav } from "components/SidebarNav";
import { useTenant } from "components/TenantProvider";
import { TenantSelector } from "components/TenantSelector";
import { UserNav } from "components/UserNav";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../../public/logo.png";

function getSidebarNavItems(tenantId: string) {
  return [
    {
      title: "Dashboard",
      href: `/manage/${tenantId}/dashboard`,
    },
    {
      title: "Profile",
      href: `/manage/profile`,
    },
    {
      title: "Team",
      href: `/manage/${tenantId}/team`,
    },
    {
      title: "Subscription",
      href: `/manage/${tenantId}/subscription`,
    },
  ];
}

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { error: tenantError, currentTenant } = useTenant();
  const { user, error: userError, isLoading: isUserLoading } = useUser();

  if (!isUserLoading && !user) {
    // User is not logged in - redirect to the login page
    window.location.href = `/api/auth/login?returnTo=${
      window.location.pathname
    }${window.location.search || ""}${window.location.hash || ""}`;
  }

  const error = userError || tenantError;
  if (error) throw error;

  if (!user || !currentTenant) {
    return (
      <div className="min-h-screen flex justify-center align-middle">
        <LoadingPlaceholder />
      </div>
    );
  }

  return (
    <div className="flex-col md:flex">
      {/* Top navigation */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Link href="/manage">
              <Image src={logo} alt="LetsGo" width={38} height={38}></Image>
            </Link>
            <div>|</div>
            <TenantSelector allowCreate={true} />
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <UserNav user={user} tenant={currentTenant} />
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 p-5 px-8">
        {/* Side navigation */}
        <aside className="-mx-4 lg:w-1/6">
          <SidebarNav items={getSidebarNavItems(currentTenant.tenantId)} />
        </aside>
        {/* Main dashboard body */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
