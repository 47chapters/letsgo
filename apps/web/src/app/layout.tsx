import { UserProvider } from "@auth0/nextjs-auth0/client";
import { TenantProvider } from "components/TenantProvider";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "components/ui/toaster";
import { cn } from "components/utils";
import "app/global.css";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <UserProvider>
          <TenantProvider>{children}</TenantProvider>
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
