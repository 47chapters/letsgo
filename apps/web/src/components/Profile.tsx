"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { GetMeResponse } from "@letsgo/types";
import { getUserAvatarFallback, useApi } from "./common-client";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { LoadingPlaceholder } from "./LoadingPlaceholder";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { CopyButton } from "./CopyButton";
import { Label } from "./ui/label";

export function Profile() {
  const { user, error: userError } = useUser();
  const { error: meError, data: me } = useApi<GetMeResponse>({
    path: `/v1/me?returnAccessToken`,
  });

  const error = meError || userError;
  if (error) throw error;

  if (!user || !me) return <LoadingPlaceholder />;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user.picture || ""}
              alt={user.nickname || user.name || ""}
            />
            <AvatarFallback>{getUserAvatarFallback(user)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>{user.name || user.email || "Unknown"}</CardTitle>
            {user.email && <CardDescription>{user.email}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-1.5">
          <Label htmlFor="issuer">Issuer</Label>
          <div className="flex">
            <Input
              id="issuer"
              disabled={true}
              value={me.identity.iss}
              className="h-8 bg-slate-300"
            />
            <CopyButton text={me.identity.iss} />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="subject">Subject</Label>
          <div className="flex">
            <Input
              id="subject"
              disabled={true}
              value={me.identity.sub}
              className="h-8 bg-slate-300"
            />
            <CopyButton text={me.identity.sub} />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="identityId">Identity ID</Label>
          <div className="flex">
            <Input
              id="identityId"
              disabled={true}
              value={me.identityId}
              className="h-8 bg-slate-300"
            />
            <CopyButton text={me.identityId} />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="token">Access token</Label>
          <div className="flex">
            <Input
              id="token"
              disabled={true}
              value={me.accessToken}
              className="h-8 bg-slate-300"
            />
            <CopyButton text={me.accessToken || ""} />
          </div>
        </div>
        <div className="mt-6">
          <Button
            onClick={() =>
              (window.location.href = "/api/auth/logout?returnTo=/")
            }
          >
            Log out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
