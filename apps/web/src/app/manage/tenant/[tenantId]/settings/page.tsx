"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Invitation } from "@letsgo/tenant";
import { GetInvitationsResponse, GetTenantUsersResponse } from "@letsgo/types";
import { CSSProperties, useEffect, useState } from "react";
import { useApi, useApiMutate } from "../../../../../components/common-client";

const style: CSSProperties = {
  border: "1px solid black",
  borderCollapse: "collapse",
  padding: "0.5em",
};

interface TeamMembersProps {
  tenantId: string;
}

function TeamMembers({ tenantId }: TeamMembersProps) {
  const { isLoading: isUserLoading, error: userError, user } = useUser();
  const { isLoading, error, data } = useApi<GetTenantUsersResponse>({
    path: `/v1/tenant/${tenantId}/user?details`,
  });

  if (isLoading || isUserLoading) return <div>Loading...</div>;
  if (error || userError) throw error || userError;

  const handleRemove = (identityId: string) => async () => {};

  return (
    <table style={style}>
      <thead>
        <tr>
          <th style={style}>Name</th>
          <th style={style}>Email</th>
          <th style={style}>Issuer</th>
          <th style={style}>Subject</th>
          <th style={style}>Action</th>
        </tr>
      </thead>
      <tbody>
        {(data?.identities || []).map((identity) => (
          <tr key={identity.identityId} style={style}>
            <td style={style}>
              {identity.user?.name || "N/A"}
              {user?.identityId === identity.identityId ? ` (that's you)` : ``}
            </td>
            <td style={style}>{identity.user?.email || "N/A"}</td>
            <td style={style}>{identity.iss}</td>
            <td style={style}>{identity.sub}</td>
            <td style={style}>
              {/** Do not allow the removal of the last member of a tenant */}
              {(data?.identities || []).length > 1 ? (
                <button onClick={handleRemove(identity.identityId)}>
                  Remove
                </button>
              ) : (
                <span>&nbsp;</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface InvitationsProps {
  tenantId: string;
}

function Invitations({ tenantId }: InvitationsProps) {
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
    noResponse: true,
    afterSuccess: refreshInvitations,
  });

  useEffect(() => {
    if (deleteInvitationId) {
      deleteInvitation();
      setDeleteInvitationId(null);
    }
  }, [deleteInvitationId]);

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
              {window.location.origin}/join/{tenantId}/{invitation.invitationId}
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

export default function Team({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId as string;
  return (
    <div>
      <p>Team members:</p>
      <TeamMembers tenantId={tenantId} />
      <p>Invitations:</p>
      <Invitations tenantId={tenantId} />
    </div>
  );
}
