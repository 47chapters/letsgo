"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { getActivePlan, getPlan } from "@letsgo/pricing";
import { PostPlanRequest, PostPlanResponse } from "@letsgo/types";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Checkout from "components/Checkout";
import { StripeElements } from "components/StripeElements";
import { useTenant } from "components/TenantProvider";
import { useApiMutate } from "components/common-client";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { PlanOption } from "components/PlanOption";
import { ArrowBigRight } from "lucide-react";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { cn } from "components/utils";

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
        router.replace(`/manage/${params.tenantId}/subscription`);
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
    // On successful completion, Stripe will redirect the browser to /manage/:tenantId/subscription.
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

    const handleCancel = async () => {
      router.replace(`/manage/${currentTenant.tenantId}/subscription`);
    };

    if (currentPlan.planId === newPlan.planId) {
      router.replace(`/manage/${currentTenant.tenantId}/subscription`);
      return <div></div>;
    }

    const confirmEmail =
      newPlan.usesStripe && !currentTenant.plan.stripeCustomerId;
    const isEmailValid = !confirmEmail || EmailRegex.test(email);

    return (
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Do you want to switch plans?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex min-w-[500px] items-stretch">
            <PlanOption plan={currentPlan} isCurrentPlan={true} />
            <div className="flex items-center">
              <ArrowBigRight className="mx-4" size={48} />
            </div>
            <PlanOption plan={newPlan} isCurrentPlan={false} />
          </div>
          {confirmEmail && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Billing e-mail address</Label>
              <Input
                type="email"
                id="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className={cn({ "border-red-500": !isEmailValid })}
                value={email}
              />
            </div>
          )}
          <div className="space-x-4">
            <Button
              disabled={isSettingNewPlan || !isEmailValid}
              onClick={handleSwitch}
            >
              Confirm
            </Button>
            <Button
              variant="secondary"
              disabled={isSettingNewPlan}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <div></div>;
}

export default SwitchPlans;
