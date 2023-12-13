"use client";

import { Account } from "components/Account";

export default function Tenant({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId as string;
  return (
    <div>
      <Account tenantId={tenantId} />
    </div>
  );
}
