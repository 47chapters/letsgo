import { UserProvider } from "@auth0/nextjs-auth0/client";
import { TenantProvider } from "../components/TenantProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <UserProvider>
        <TenantProvider>
          <body>{children}</body>
        </TenantProvider>
      </UserProvider>
    </html>
  );
}
