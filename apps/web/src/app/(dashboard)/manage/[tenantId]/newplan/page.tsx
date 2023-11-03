"use client";

import { ActivePlans, Plan } from "@letsgo/pricing";
import { useRouter } from "next/navigation";
import { PlanSelector } from "../../../../../components/PlanSelector";
import { useTenant } from "../../../../../components/TenantProvider";

function ChooseNewPlan({ params }: { params: { tenantId: string } }) {
  const router = useRouter();
  const { error, currentTenant } = useTenant();

  if (error) throw error;

  const handlePlanSelected = async (plan: Plan) => {
    if (plan.actionUrl) {
      router.push(
        `${plan.actionUrl}?planId=${encodeURIComponent(
          plan.planId
        )}&from=/manage/${currentTenant?.tenantId}/newplan`
      );
    } else {
      window.location.href = `/manage/newplan/${encodeURIComponent(
        plan.planId
      )}`;
    }
  };

  if (currentTenant) {
    return (
      <div>
        <h1>Select new plan</h1>
        <PlanSelector
          plans={ActivePlans}
          currentPlanId={currentTenant.plan.planId}
          onPlanSelected={handlePlanSelected}
        />
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default ChooseNewPlan;
