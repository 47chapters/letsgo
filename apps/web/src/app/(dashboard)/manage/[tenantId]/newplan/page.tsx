"use client";

import { ActivePlans, Plan } from "@letsgo/pricing";
import { PlanSelector } from "components/PlanSelector";
import { useTenant } from "components/TenantProvider";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { useRouter } from "next/navigation";

function ChooseNewPlan() {
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
      router.push(`/manage/newplan/${encodeURIComponent(plan.planId)}`);
    }
  };

  if (currentTenant) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Select new plan</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanSelector
            plans={ActivePlans}
            currentPlanId={currentTenant.plan.planId}
            onPlanSelected={handlePlanSelected}
          />
        </CardContent>
      </Card>
    );
  }

  return <div></div>;
}

export default ChooseNewPlan;
