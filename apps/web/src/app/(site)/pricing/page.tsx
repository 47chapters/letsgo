"use client";

import { ActivePlans, Plan } from "@letsgo/pricing";
import { PlanSelector } from "../../../components/PlanSelector";
import { useTenant } from "../../../components/TenantProvider";
import { useRouter } from "next/navigation";

export default function Pricing() {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const currentPlanId = currentTenant?.plan.planId;

  const handlePlanSelected = async (plan: Plan) => {
    if (plan.actionUrl) {
      router.push(
        `${plan.actionUrl}?planId=${encodeURIComponent(
          plan.planId
        )}&from=/pricing`
      );
    } else {
      /**
       * Send the browser to the non-tenant-specific management path for setting up a new plan. This
       * handles the case when the user does not yet have an account. They will be
       * prompted to log in and their first tenant will be created before the new plan is
       * set for them. If they are aleady logged in, they will be switching their current tenant to the
       * new plan.
       */
      window.location.href = `/manage/newplan/${encodeURIComponent(
        plan.planId
      )}`;
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Pricing</h1>
      <PlanSelector
        plans={ActivePlans}
        onPlanSelected={handlePlanSelected}
        currentPlanId={currentPlanId}
      ></PlanSelector>
    </div>
  );
}
