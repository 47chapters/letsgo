"use client";

import { Plan } from "@letsgo/pricing";

interface PlanOptionProps {
  plan: Plan;
  isCurrentPlan: boolean;
  actionVerb: string;
  onPlanSelected: () => Promise<void>;
}

function PlanOption({
  plan,
  isCurrentPlan,
  actionVerb,
  onPlanSelected,
}: PlanOptionProps) {
  return (
    <div
      key={plan.planId}
      style={{
        display: "flex",
        minWidth: "200px",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: isCurrentPlan ? "aliceblue" : "",
        padding: "20px",
      }}
    >
      <div>
        <h2>{plan.name}</h2>
      </div>
      <div>{plan.descripton}</div>
      <br></br>
      <div>
        <b>{plan.price || <span>&nbsp;</span>}</b>
      </div>

      <div style={{ width: "100%" }}>
        <ul>
          {plan.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
      <div style={{ height: "100%", display: "flex", alignItems: "flex-end" }}>
        {isCurrentPlan ? (
          <div>This is your current plan</div>
        ) : (
          actionVerb && <button onClick={onPlanSelected}>{actionVerb}</button>
        )}
      </div>
    </div>
  );
}

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
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
        flexWrap: "wrap",
        alignItems: "stretch",
      }}
    >
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
