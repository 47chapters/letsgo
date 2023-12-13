import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { Button } from "components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { getUserAvatarFallback } from "./common-client";

import { UserProfile } from "@auth0/nextjs-auth0/client";
import { Tenant } from "@letsgo/tenant";

export interface UserNaveProps {
  user: UserProfile;
  tenant: Tenant;
}

export function UserNav({ user, tenant }: UserNaveProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.picture || ""}
              alt={user.nickname || user.name || ""}
            />
            <AvatarFallback>{getUserAvatarFallback(user)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {user.name && (
              <p className="text-sm font-medium leading-none">
                {user.name || user.email || "No user name"}
              </p>
            )}
            {user.name && user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push(`/manage/${tenant.tenantId}/dashboard`)}
          >
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/manage/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/manage/${tenant.tenantId}/team`)}
          >
            Team
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/manage/${tenant.tenantId}/subscription`)
            }
          >
            Subscription
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/contact?context=help")}
          >
            Help
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => (window.location.href = "/api/auth/logout?returnTo=/")}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
