"use client";

import { Team } from "components/Team";
import { Invitations } from "components/Invitations";

export default function ManageTeam({
  params,
}: {
  params: { tenantId: string };
}) {
  const tenantId = params.tenantId as string;
  return (
    <div className="space-y-4">
      <Team tenantId={tenantId} />
      <Invitations tenantId={tenantId} />
    </div>
  );
}
