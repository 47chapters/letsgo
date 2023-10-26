"use client";

import Navbar from "../../components/Navbar";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  return (
    <div>
      <Navbar>
        <div>
          <Link href="/">Home</Link> • <Link href="/pricing">Pricing</Link> • 
          <a href="/manage">{user ? "Manage" : "Login"}</a>
        </div>
      </Navbar>
      {children}
    </div>
  );
}
