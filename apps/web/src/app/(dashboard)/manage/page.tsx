"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "components/TenantProvider";

function ResolveTenant() {
  const router = useRouter();
  const { error, currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      router.replace(`/manage/${currentTenant.tenantId}/dashboard`);
    }
  }, [currentTenant, router]);

  if (error) throw error;

  return <div></div>;
}

export default ResolveTenant;
