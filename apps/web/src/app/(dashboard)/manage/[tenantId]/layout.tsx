"use client";

import { useEffect } from "react";
import { useTenant } from "components/TenantProvider";

export default function CheckAccessToTenant({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantId: string };
}) {
  const { error, tenants, currentTenant, getTenant, setCurrentTenant } =
    useTenant();

  useEffect(() => {
    if (tenants) {
      const tenant = getTenant(params.tenantId);
      if (!tenant) {
        throw new Error(`You don't have access to tenant ${params.tenantId}`);
      }
      setCurrentTenant(tenant);
    }
  }, [tenants, params.tenantId, setCurrentTenant, getTenant]);

  if (error) throw error;

  return currentTenant?.tenantId === params.tenantId ? (
    <div>{children}</div>
  ) : (
    <div></div>
  );
}
