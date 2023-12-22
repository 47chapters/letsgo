"use client";

import { Invitation } from "@letsgo/tenant";
import { GetInvitationsResponse } from "@letsgo/types";
import { useEffect, useState } from "react";
import { useApi, useApiMutate } from "./common-client";

import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Trash2 } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { LoadingPlaceholder } from "./LoadingPlaceholder";
import { useToast } from "components/ui/use-toast";

function getInvitationUrl(tenantId: string, invitationId: string) {
  return `${window.location.origin}/join/${tenantId}/${invitationId}`;
}

export interface InvitationsProps {
  tenantId: string;
}

export function Invitations({ tenantId }: InvitationsProps) {
  const { toast } = useToast();
  const {
    isLoading: isLoadingInvitations,
    error: errorLoadingInitations,
    data: invitationsResponse,
    mutate: refreshInvitations,
  } = useApi<GetInvitationsResponse>({
    path: `/v1/tenant/${tenantId}/invitation`,
  });
  const { invitations } = invitationsResponse || {};
  const {
    isMutating: isCreatingInvitation,
    error: errorCreatingInvitation,
    trigger: createInvitation,
  } = useApiMutate<Invitation>({
    path: `/v1/tenant/${tenantId}/invitation`,
    method: "POST",
    afterSuccess: async (result) => {
      const invitationUrl = getInvitationUrl(
        tenantId,
        (result as Invitation).invitationId
      );
      navigator.clipboard.writeText(invitationUrl);
      toast({
        title: "New invitation URL copied to clipboard",
      });
    },
  });
  const [deleteInvitationId, setDeleteInvitationId] = useState<string | null>(
    null
  );
  const {
    isMutating: isDeletingInvitation,
    error: errorDeletingInvitation,
    trigger: deleteInvitation,
  } = useApiMutate<any>({
    path: `/v1/tenant/${tenantId}/invitation/${deleteInvitationId}`,
    method: "DELETE",
    afterSuccess: refreshInvitations,
  });

  useEffect(() => {
    if (deleteInvitationId) {
      deleteInvitation();
      setDeleteInvitationId(null);
    }
  }, [deleteInvitation, deleteInvitationId]);

  const error =
    errorLoadingInitations ||
    errorCreatingInvitation ||
    errorDeletingInvitation;
  if (error) throw error;

  const handleRemove = (invitationId: string) => async () => {
    setDeleteInvitationId(invitationId);
  };

  const handleCreate = async () => {
    createInvitation();
  };

  const getTimeRemaining = (invitation: Invitation) => {
    const expiresAt = new Date(invitation.expiresAt).getTime();
    const now = new Date().getTime();
    const remaining = expiresAt - now;
    const hours = Math.floor(remaining / 1000 / 60 / 60);
    const minutes = Math.floor(
      (remaining - hours * 1000 * 60 * 60) / 1000 / 60
    );
    return `${hours}h${String(minutes).padStart(2, "0")}m`;
  };

  return isLoadingInvitations ? (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <LoadingPlaceholder></LoadingPlaceholder>
      </CardContent>
    </Card>
  ) : (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Invitations</CardTitle>
        {!invitations?.length ? (
          <CardDescription>
            To add new members to the team, create an invitation.
          </CardDescription>
        ) : (
          <CardDescription>
            Invitations to join the team are confidential, can be used by
            anyone, and expire after 24h. Send the invitation URL to the
            intended recipient using a trusted channel, e.g. e-mail.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="grid gap-6">
        {(invitations || []).map((invitation) => (
          <div
            className="flex items-center justify-between space-x-4"
            key={invitation.invitationId}
          >
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm font-medium leading-none">
                  {invitation.invitationId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires in: {getTimeRemaining(invitation)}
                </p>
              </div>
            </div>
            <div>
              <CopyButton
                text={getInvitationUrl(tenantId, invitation.invitationId)}
                tooltipText="Copy invitation URL"
                buttonClassName=""
                iconClassName="h-4 w-4"
              ></CopyButton>
              <Button
                variant="ghost"
                disabled={isDeletingInvitation}
                onClick={handleRemove(invitation.invitationId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <div>
          <Button disabled={isCreatingInvitation} onClick={handleCreate}>
            Create invitation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
