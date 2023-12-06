"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "components/TenantProvider";

function ResolveTenant() {
  const router = useRouter();
  const { error, currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      router.replace(`/manage/${currentTenant.tenantId}/settings`);
    }
  }, [currentTenant, router]);

  if (error) throw error;

  return <div>Loading...</div>;
}

export default ResolveTenant;
