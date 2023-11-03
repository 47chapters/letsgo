"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { getActivePlan, getPlan } from "@letsgo/pricing";
import { PostPlanRequest, PostPlanResponse } from "@letsgo/types";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Checkout from "../../../../../../components/Checkout";
import { StripeElements } from "../../../../../../components/StripeElements";
import { useTenant } from "../../../../../../components/TenantProvider";
import { useApiMutate } from "../../../../../../components/common-client";

const EmailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

function SwitchPlans({
  params,
}: {
  params: { tenantId: string; planId: string };
}) {
  const router = useRouter();
  const { error: userError, user } = useUser();
  const [email, setEmail] = useState("");
  const { error: tenantError, currentTenant, refreshTenants } = useTenant();
  const {
    isMutating: isSettingNewPlan,
    error: errorSettingNewPlan,
    data: planResponse,
    trigger: setPlan,
  } = useApiMutate<PostPlanResponse | undefined>({
    path: `/v1/tenant/${currentTenant?.tenantId}/plan`,
    method: "POST",
    afterSuccess: async (data) => {
      if (data === undefined) {
        // Plan transition is complete - return to the management page
        refreshTenants();
        router.replace(`/manage/${params.tenantId}/settings`);
      }
    },
  });

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  const newPlan = getActivePlan(params.planId);
  if (!newPlan) return notFound();
  const error = userError || tenantError || errorSettingNewPlan;
  if (error) throw error;

  if (planResponse) {
    // New plan requires payment information - collect it using Stripe.
    // On successful completion, Stripe will redirect the browser to /manage/:tenantId/settings.
    return (
      <StripeElements
        publicKey={planResponse.publicKey}
        clientSecret={planResponse.clientSecret}
      >
        <Checkout
          tenantId={currentTenant?.tenantId as string}
          mode="payment"
          title="Payment details"
        />
      </StripeElements>
    );
  } else if (currentTenant && user) {
    // Present the details of the intended plan switch and confirm the user wants to proceed
    const currentPlan = getPlan(currentTenant.plan.planId);
    if (!currentPlan) {
      throw new Error(
        `The current plan '${currentTenant.plan.planId}' cannot be found in the system.`
      );
    }

    const handleSwitch = async () => {
      const request: PostPlanRequest = {
        planId: newPlan.planId,
        email,
        name: user.name || undefined,
      };
      setPlan(request);
    };

    if (currentPlan.planId === newPlan.planId) {
      return (
        <div>
          <p>
            You are already subscribed to this plan:{" "}
            <b>
              {currentPlan.name} ({currentPlan.price})
            </b>
          </p>
          <button
            onClick={() =>
              router.replace(`/manage/${currentTenant.tenantId}/settings`)
            }
          >
            Manage plan
          </button>
        </div>
      );
    }

    const confirmEmail =
      newPlan.usesStripe && !currentTenant.plan.stripeCustomerId;
    const isEmailValid = !confirmEmail || EmailRegex.test(email);

    return (
      <div>
        <h1>Switching Plans</h1>
        <p>
          Current plan:{" "}
          <b>
            {currentPlan.name} ({currentPlan.price})
          </b>
        </p>
        <p>
          New plan:{" "}
          <b>
            {newPlan.name} ({newPlan.price})
          </b>
        </p>
        {confirmEmail && (
          <p>
            Billing e-mail address:{" "}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={isEmailValid ? {} : { color: "red" }}
            />
          </p>
        )}
        <button
          disabled={isSettingNewPlan || !isEmailValid}
          onClick={handleSwitch}
        >
          Confirm
        </button>
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default SwitchPlans;
