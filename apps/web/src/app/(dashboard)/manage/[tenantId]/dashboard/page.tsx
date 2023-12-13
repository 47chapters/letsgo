"use client";

import { Dashboard } from "components/Dashboard";

export default function DashboardView({
  params,
}: {
  params: { tenantId: string };
}) {
  const tenantId = params.tenantId as string;
  return (
    <div>
      <Dashboard tenantId={tenantId} />
    </div>
  );
}
