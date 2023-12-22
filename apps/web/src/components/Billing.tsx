"use client";

import { Tenant } from "@letsgo/tenant";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { useRouter } from "next/navigation";

export interface BillingProps {
  tenant: Tenant;
}

export function Billing({ tenant }: BillingProps) {
  const router = useRouter();

  const subscription = tenant.plan.stripeSubscription;

  const handleChangePaymentMethod = async () => {
    router.push(`/manage/${tenant.tenantId}/paymentmethod`);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      {subscription && (
        <CardContent className="flex flex-1 flex-col gap-6 justify-between">
          <div>
            <p className="text-sm font-medium leading-none">Status</p>
            <p className="text-sm text-muted-foreground">
              {subscription.status}
            </p>
          </div>
          {subscription.card && (
            <div>
              <p className="text-sm font-medium leading-none">Payment method</p>
              <p className="text-sm text-muted-foreground">
                {subscription.card.brand} •••• {subscription.card.last4}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium leading-none">
              Current period ends
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(subscription.currentPeriodEnd).toDateString()}
            </p>
          </div>
          <div className="flex flex-1 flex-col justify-end">
            <div>
              <Button onClick={handleChangePaymentMethod}>
                Change payment method
              </Button>
            </div>
          </div>
        </CardContent>
      )}
      {!subscription && (
        <CardContent className="grid gap-6">
          <p>No billing information on file.</p>
        </CardContent>
      )}
    </Card>
  );
}
