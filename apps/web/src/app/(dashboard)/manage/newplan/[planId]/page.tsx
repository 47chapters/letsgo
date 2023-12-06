"use client";

import { useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { useTenant } from "components/TenantProvider";
import { getActivePlan } from "@letsgo/pricing";

function ResolveTenantForNewPlan({ params }: { params: { planId: string } }) {
  const router = useRouter();
  const { error, currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant && !!getActivePlan(params.planId)) {
      router.replace(
        `/manage/${currentTenant.tenantId}/newplan/${params.planId}`
      );
    }
  }, [currentTenant, router, params.planId]);

  if (error) throw error;
  if (!getActivePlan(params.planId)) return notFound();

  return <div>Loading...</div>;
}

export default ResolveTenantForNewPlan;
