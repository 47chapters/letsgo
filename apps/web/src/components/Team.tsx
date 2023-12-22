"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { GetTenantUsersResponse } from "@letsgo/types";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserAvatarFallback, useApi, useApiMutate } from "./common-client";

import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { CopyButton } from "./CopyButton";
import { LoadingPlaceholder } from "./LoadingPlaceholder";
import { ConfirmDialog } from "./ConfirmDialog";

export interface TeamProps {
  tenantId: string;
}

export function Team({ tenantId }: TeamProps) {
  const { isLoading: isUserLoading, error: userError, user } = useUser();
  const {
    isLoading: isUsersLoading,
    error: usersError,
    data,
    mutate: refreshUsers,
  } = useApi<GetTenantUsersResponse>({
    path: `/v1/tenant/${tenantId}/user?details`,
  });
  const [deleteIdentityId, setDeleteIdentityId] = useState<string | null>(null);
  const {
    isMutating: isDeletingIdentity,
    error: errorDeletingIdentity,
    trigger: deleteIdentity,
  } = useApiMutate<any>({
    path: `/v1/tenant/${tenantId}/user/${deleteIdentityId}`,
    method: "DELETE",
    afterSuccess: refreshUsers,
  });

  useEffect(() => {
    if (deleteIdentityId) {
      deleteIdentity();
      setDeleteIdentityId(null);
    }
  }, [deleteIdentity, deleteIdentityId]);

  const error = usersError || errorDeletingIdentity || userError;
  if (error) throw error;

  const handleRemove = (identityId: string) => async () => {
    setDeleteIdentityId(identityId);
  };

  return isUsersLoading || isUserLoading ? (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingPlaceholder></LoadingPlaceholder>
      </CardContent>
    </Card>
  ) : (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          All team members have full access to the tenant.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {(data?.identities || []).map((identity) => (
          <div
            className="flex items-center justify-between space-x-4"
            key={identity.identityId}
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={identity.user?.picture} />
                <AvatarFallback>
                  {getUserAvatarFallback(identity.user || {})}
                </AvatarFallback>
              </Avatar>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="link" className="p-0 m-0 h-1">
                      <p className="text-sm font-medium leading-none">
                        {identity.user?.name || "Unknown"}
                        {user?.identityId === identity.identityId
                          ? ` (that's you)`
                          : ``}
                      </p>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">
                          {identity.user?.name || "Unknown"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          User&apos;s identity
                        </p>
                      </div>
                      <div className="grid gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="issuer">Issuer</Label>
                          <div className="flex">
                            <Input
                              id="issuer"
                              disabled={true}
                              value={identity.iss}
                              className="h-8 bg-slate-300"
                            />
                            <CopyButton text={identity.iss} />
                          </div>
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="subject">Subject</Label>
                          <div className="flex">
                            <Input
                              id="subject"
                              disabled={true}
                              value={identity.sub}
                              className="h-8 bg-slate-300"
                            />
                            <CopyButton text={identity.sub} />
                          </div>
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="identityId">Identity ID</Label>
                          <div className="flex">
                            <Input
                              id="identityId"
                              disabled={true}
                              value={identity.identityId}
                              className="h-8 bg-slate-300"
                            />
                            <CopyButton text={identity.identityId} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {identity.user?.email && (
                  <p className="text-sm text-muted-foreground">
                    {identity.user?.email}
                  </p>
                )}
              </div>
            </div>
            <ConfirmDialog
              title={`Remove ${identity.user?.name || "team member"}?`}
              description={`Are you sure you want to remove ${
                identity.user?.name || "this team member"
              }? They will lose access to the system.`}
              trigger={
                <Button
                  variant="ghost"
                  disabled={
                    user?.identityId === identity.identityId ||
                    deleteIdentityId === identity.identityId
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              confirm={<Button variant="destructive">Remove</Button>}
              onConfirm={handleRemove(identity.identityId)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
