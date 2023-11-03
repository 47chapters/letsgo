"use client";

import { getPlan } from "@letsgo/pricing";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTenant } from "./TenantProvider";
import { useApiMutate } from "./common-client";

export interface AccountProps {
  tenantId: string;
}

export function Account({ tenantId }: AccountProps) {
  const router = useRouter();
  const { isLoading, error: tenantError, currentTenant } = useTenant();
  const [confirmDeleteTenant, setConfirmDeleteTenant] = useState(false);
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

  if (isLoading) return <div>Loading...</div>;
  if (isDeletingTenant) return <div>Deleting...</div>;
  const error = tenantError || errorDeletingTenant;
  if (error) throw error;

  const plan = getPlan(currentTenant?.plan.planId || "");
  const isStripePlan = plan?.usesStripe;

  const handleChangePlan = async () => {
    router.push(`/manage/${tenantId}/newplan`);
  };

  const handleChangePaymentMethod = async () => {
    router.push(`/manage/${tenantId}/paymentmethod`);
  };

  const handleDelete = async () => {
    if (!confirmDeleteTenant) {
      setConfirmDeleteTenant(true);
    } else {
      deleteTenant();
    }
  };

  return (
    <div>
      <p>
        Your current subscription plan is:{" "}
        <b>{plan ? `${plan.name} (${plan.price})` : "Unknown"}</b>
      </p>
      {isStripePlan && currentTenant?.plan.stripeSubscription && (
        <p>
          Billing status: <b>{currentTenant.plan.stripeSubscription.status}</b>{" "}
          {currentTenant.plan.stripeSubscription.card && (
            <span>
              ({currentTenant.plan.stripeSubscription.card.brand} ••••{" "}
              {currentTenant.plan.stripeSubscription.card.last4})
            </span>
          )}
        </p>
      )}
      {isStripePlan &&
        currentTenant?.plan.stripeSubscription?.currentPeriodEnd && (
          <p>
            Current period ends:{" "}
            <b>
              {new Date(
                currentTenant?.plan.stripeSubscription?.currentPeriodEnd
              ).toDateString()}
            </b>
          </p>
        )}
      {!confirmDeleteTenant && (
        <span>
          <button onClick={handleChangePlan}>Change plan</button>{" "}
          {plan?.usesStripe && (
            <span>
              <button onClick={handleChangePaymentMethod}>
                Change payment method
              </button>{" "}
            </span>
          )}
        </span>
      )}
      {confirmDeleteTenant && (
        <p style={{ color: "red" }}>
          Do you really want to delete the tenant and all its data? It cannot be
          undone.
        </p>
      )}
      <button onClick={handleDelete}>
        {confirmDeleteTenant ? "Yes" : "Delete tenant"}
      </button>{" "}
      {confirmDeleteTenant && (
        <button onClick={() => setConfirmDeleteTenant(false)}>No</button>
      )}
    </div>
  );
}
