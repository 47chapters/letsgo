"use client";

import { Plan } from "@letsgo/pricing";
import { PlanOption } from "components/PlanOption";

export interface PlanSelectorProps {
  plans: Plan[];
  currentPlanId?: string;
  onPlanSelected: (plan: Plan) => Promise<void>;
}

export function PlanSelector({
  plans,
  currentPlanId,
  onPlanSelected,
}: PlanSelectorProps) {
  return (
    <div className="flex gap-4 items-stretch flex-wrap content-center">
      {plans.map((plan) => (
        <PlanOption
          key={plan.planId}
          plan={plan}
          isCurrentPlan={plan.planId === currentPlanId}
          actionVerb={
            plan.actionVerb || (!currentPlanId ? "Get Started" : "Select")
          }
          onPlanSelected={() => onPlanSelected(plan)}
        ></PlanOption>
      ))}
    </div>
  );
}
