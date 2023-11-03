"use client";

import { Account } from "../../../../../components/Account";
import { Team } from "../../../../../components/Team";
import { Invitations } from "../../../../../components/Invitations";

export default function Tenant({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId as string;
  return (
    <div>
      <h1>Tenant</h1>
      <h3>Account</h3>
      <Account tenantId={tenantId} />
      <h3>Team</h3>
      <Team tenantId={tenantId} />
      <h3>Invitations</h3>
      <Invitations tenantId={tenantId} />
    </div>
  );
}
