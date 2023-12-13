"use client";

import { Tenant } from "@letsgo/tenant";
import { getPlan } from "@letsgo/pricing";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { useRouter } from "next/navigation";
import { PlanOption } from "./PlanOption";

export interface SubscriptionPlanProps {
  tenant: Tenant;
}

export function SubscriptionPlan({ tenant }: SubscriptionPlanProps) {
  const router = useRouter();

  const plan = getPlan(tenant.plan.planId);

  const handleChangePlan = async () => {
    router.push(`/manage/${tenant.tenantId}/newplan`);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Current plan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6 justify-between">
        <div>{plan && <PlanOption plan={plan} isCurrentPlan={true} />}</div>
        <div className="flex flex-1 flex-col justify-end">
          <div>
            <Button onClick={handleChangePlan}>Change plan</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
