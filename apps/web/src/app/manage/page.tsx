"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "../../components/TenantProvider";

function ResolveTenant() {
  const router = useRouter();
  const { error, currentTenantId } = useTenant();

  useEffect(() => {
    if (currentTenantId) {
      router.replace(`/manage/${currentTenantId}/settings`);
    }
  }, [currentTenantId, router]);

  if (error) throw error;

  return <div>Loading...</div>;
}

export default ResolveTenant;
