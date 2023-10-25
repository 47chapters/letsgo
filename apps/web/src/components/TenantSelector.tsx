"use client";

import { useTenant } from "./TenantProvider";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiMutate } from "./common-client";
import { Tenant } from "@letsgo/tenant";

const createValue = "create";

export interface TenantSelectorProps {
  allowCreate?: boolean;
}

export function TenantSelector({ allowCreate = false }: TenantSelectorProps) {
  const {
    isLoading: isTenantLoading,
    error: tenantsError,
    currentTenantId,
    tenants,
    setCurrentTenantId,
    refreshTenants,
  } = useTenant();
  const router = useRouter();
  const {
    isMutating: isCreatingTenant,
    error: errorCreatingTenant,
    trigger: createTenant,
    data: newTenant,
  } = useApiMutate<Tenant>({
    path: `/v1/tenant`,
    method: "POST",
    afterSuccess: async (newTenant) => {
      if (newTenant) {
        await refreshTenants();
        setCurrentTenantId(newTenant.tenantId);
        router.push(`/manage/${newTenant.tenantId}/settings`);
      }
    },
  });

  const handleTenantChange = useCallback(
    async (e: any) => {
      const tenantId = e.target.value;
      if (tenantId === createValue) {
        createTenant();
      } else {
        setCurrentTenantId(tenantId);
        router.push(`/manage/${tenantId}/settings`);
      }
    },
    [setCurrentTenantId, createTenant, router]
  );

  const error = tenantsError || errorCreatingTenant;
  if (error) throw error;

  if (isTenantLoading) {
    return <span>Loading...</span>;
  }

  if (isCreatingTenant) {
    return <span>Creating...</span>;
  }

  if (tenants) {
    return (
      <select value={currentTenantId} onChange={handleTenantChange}>
        {tenants.map((tenant) => (
          <option value={tenant.tenantId} key={tenant.tenantId}>
            {tenant.displayName}
          </option>
        ))}
        {allowCreate && <option value={createValue}>-- Create new --</option>}
      </select>
    );
  }

  return <span></span>;
}
