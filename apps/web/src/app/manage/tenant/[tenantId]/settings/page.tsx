"use client";

import { GetTenantUsersResponse } from "@letsgo/types";
import { useApi } from "../../../../../components/common-client";
import { CSSProperties } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

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

  const style: CSSProperties = {
    border: "1px solid black",
    borderCollapse: "collapse",
    padding: "0.5em",
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

export default function Team({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId as string;
  return (
    <div>
      <p>Team members:</p>
      <TeamMembers tenantId={tenantId} />
    </div>
  );
}
