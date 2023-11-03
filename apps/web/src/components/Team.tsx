"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { GetTenantUsersResponse } from "@letsgo/types";
import { CSSProperties, useEffect, useState } from "react";
import { useApi, useApiMutate } from "./common-client";

const style: CSSProperties = {
  border: "1px solid black",
  borderCollapse: "collapse",
  padding: "0.5em",
};

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

  if (isUsersLoading || isUserLoading) return <div>Loading...</div>;
  const error = usersError || errorDeletingIdentity || userError;
  if (error) throw error;

  const handleRemove = (identityId: string) => async () => {
    setDeleteIdentityId(identityId);
  };

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
              {/** Do not allow the removal of self */}
              <button
                disabled={
                  user?.identityId === identity.identityId ||
                  deleteIdentityId === identity.identityId
                }
                onClick={handleRemove(identity.identityId)}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
