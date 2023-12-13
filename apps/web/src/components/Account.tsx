"use client";

import { getPlan } from "@letsgo/pricing";
import { Billing } from "./Billing";
import { DeleteTenant } from "./DeleteTenant";
import { LoadingPlaceholder } from "./LoadingPlaceholder";
import { SubscriptionPlan } from "./SuscriptionPlan";
import { useTenant } from "./TenantProvider";
import { useApiMutate } from "./common-client";

export interface AccountProps {
  tenantId: string;
}

export function Account({ tenantId }: AccountProps) {
  const { error: tenantError, currentTenant } = useTenant();
  const {
    isMutating: isDeletingTenant,
    error: errorDeletingTenant,
    trigger: deleteTenant,
  } = useApiMutate<void>({
    path: `/v1/tenant/${tenantId}`,
    method: "DELETE",
    afterSuccess: async () => {
      window.location.href = "/manage";
    },
  });

  const error = tenantError || errorDeletingTenant;
  if (error) throw error;

  const plan = getPlan(currentTenant?.plan.planId || "");
  const isStripePlan = plan?.usesStripe;

  const handleDelete = async () => {
    deleteTenant();
  };

  return !currentTenant || isDeletingTenant ? (
    <LoadingPlaceholder />
  ) : (
    <div className="grid gap-4 max-w-2xl">
      <div className="flex gap-4 items-stretch">
        <SubscriptionPlan tenant={currentTenant} />
        <div className="flex-1">
          <Billing tenant={currentTenant} />
        </div>
      </div>
      <DeleteTenant tenant={currentTenant} onDeleteTenant={handleDelete} />
    </div>
  );
}
