"use client";

import useSWR from "swr";
import { useTenant } from "./TenantProvider";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const createValue = "create";

export interface TenantSelectorProps {
  allowCreate?: boolean;
}

export function TenantSelector({ allowCreate = false }: TenantSelectorProps) {
  const { isLoading, error, currentTenantId, tenants, setCurrentTenantId } =
    useTenant();
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const { isLoading: createTenantIsLoading, error: createTenantError } = useSWR(
    creating ? "/api/proxy/v1/tenant" : null,
    async (url: string) => {
      const result = await fetch(url, {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!result.ok) {
        throw new Error(
          `Failed to create a new tenant with HTTP POST ${url}: HTTP ${result.status} ${result.statusText}`
        );
      }

      const newTenant = await result.json();

      if (tenants) {
        await setCurrentTenantId(newTenant.tenantId, true);
        setCreating(false);
        router.push(`/manage/tenant/${newTenant.tenantId}/settings`);
      }

      return newTenant;
    }
  );

  const handleTenantChange = useCallback(
    async (e: any) => {
      const tenantId = e.target.value;
      if (tenantId === createValue) {
        setCreating(true);
      } else {
        setCurrentTenantId(tenantId);
        router.push(`/manage/tenant/${tenantId}/settings`);
      }
    },
    [setCurrentTenantId]
  );

  if (createTenantError || error) {
    throw createTenantError || error;
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (createTenantIsLoading) {
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
