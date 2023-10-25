"use client";

import { useEffect } from "react";
import { useTenant } from "../../../components/TenantProvider";

export default function CheckAccessToTenant({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantId: string };
}) {
  const { isLoading, error, tenants, currentTenantId, setCurrentTenantId } =
    useTenant();

  useEffect(() => {
    if (tenants) {
      if (!tenants.find((tenant) => tenant.tenantId === params.tenantId)) {
        throw new Error(`You don't have access to tenant ${params.tenantId}`);
      }
      setCurrentTenantId(params.tenantId);
    }
  }, [tenants, params.tenantId, setCurrentTenantId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) throw error;

  return currentTenantId === params.tenantId ? (
    <div>{children}</div>
  ) : (
    <div>Loading...</div>
  );
}
