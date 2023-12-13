"use client";

import { Plan } from "@letsgo/pricing";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";

interface PlanOptionProps {
  plan: Plan;
  isCurrentPlan: boolean;
  actionVerb?: string;
  onPlanSelected?: () => Promise<void>;
}

export function PlanOption({
  plan,
  isCurrentPlan,
  actionVerb,
  onPlanSelected,
}: PlanOptionProps) {
  return (
    <Card key={plan.planId} className="w-[220px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-center">{plan.name}</CardTitle>
        <CardDescription className="text-center">
          {plan.descripton}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="text-lg font-semibold text-center">
          {plan.price || <span>&nbsp;</span>}
        </div>
        <div className="mt-4">
          <ul className="[&>li]:mt-1">
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        {onPlanSelected ? (
          <div className="flex-1 flex flex-col justify-end content-center mt-8">
            {isCurrentPlan ? (
              <Button disabled variant="ghost">
                Your current plan
              </Button>
            ) : (
              actionVerb && (
                <Button onClick={onPlanSelected}>{actionVerb}</Button>
              )
            )}
          </div>
        ) : (
          <div className="flex-1"></div>
        )}
      </CardContent>
    </Card>
  );
}
