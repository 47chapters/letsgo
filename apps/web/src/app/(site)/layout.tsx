"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useTenant } from "components/TenantProvider";
import { UserNav } from "components/UserNav";
import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/logo.png";
import { Button } from "components/ui/button";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentTenant, isLoading: isTenantLoading } = useTenant();
  const { user, isLoading: isUserLoading } = useUser();

  return (
    <div className="flex-col md:flex">
      {/* Top navigation */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Image src={logo} alt="LetsGo" width={38} height={38}></Image>
            </Link>
            <div>|</div>
            <Button variant="link" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="link" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="link" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
          {!(isUserLoading || isTenantLoading) && (
            <div className="ml-auto flex items-center space-x-4">
              {user && currentTenant && (
                <UserNav user={user} tenant={currentTenant} />
              )}
              {!(user && currentTenant) && (
                <div>
                  <Button
                    variant="link"
                    onClick={() =>
                      (window.location.href = `/api/auth/login?returnTo=/manage`)
                    }
                  >
                    Log in
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        {/* Main site body */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
