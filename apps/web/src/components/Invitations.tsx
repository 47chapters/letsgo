"use client";

import { Invitation } from "@letsgo/tenant";
import { GetInvitationsResponse } from "@letsgo/types";
import { CSSProperties, useEffect, useState } from "react";
import { useApi, useApiMutate } from "./common-client";

const style: CSSProperties = {
  border: "1px solid black",
  borderCollapse: "collapse",
  padding: "0.5em",
};

export interface InvitationsProps {
  tenantId: string;
}

export function Invitations({ tenantId }: InvitationsProps) {
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

  if (isLoadingInvitations) return <div>Loading...</div>;
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

  const invitationsComponent = !invitations?.length ? (
    <div>No active invitations.</div>
  ) : (
    <div>
      <table style={style}>
        <thead>
          <tr>
            <th style={style}>Url</th>
            <th style={style}>Created</th>
            <th style={style}>Expires</th>
            <th style={style}>Action</th>
          </tr>
        </thead>
        <tbody>
          {(invitations || []).map((invitation) => (
            <tr key={invitation.invitationId} style={style}>
              <td style={style}>
                {window.location.origin}/join/{tenantId}/
                {invitation.invitationId}
              </td>
              <td style={style}>{new Date(invitation.createdAt).toString()}</td>
              <td style={style}>{new Date(invitation.expiresAt).toString()}</td>
              <td style={style}>
                <button
                  disabled={isDeletingInvitation}
                  onClick={handleRemove(invitation.invitationId)}
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        NOTE: Invitation URLs are tenant-specific, confidential, can be used by
        anyone, and expire after 24h. Send them to the intended recipient using
        a trusted channel, e.g. e-mail.
      </p>
    </div>
  );

  return (
    <div>
      {invitationsComponent}
      <br />
      <button disabled={isCreatingInvitation} onClick={handleCreate}>
        {isCreatingInvitation ? "Creating invitation..." : "Create invitation"}
      </button>
    </div>
  );
}
