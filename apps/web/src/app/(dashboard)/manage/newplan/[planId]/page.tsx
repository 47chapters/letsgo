"use client";

import { useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { useTenant } from "components/TenantProvider";
import { getActivePlan } from "@letsgo/pricing";
import { LoadingPlaceholder } from "components/LoadingPlaceholder";

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

  return <LoadingPlaceholder />;
}

export default ResolveTenantForNewPlan;
