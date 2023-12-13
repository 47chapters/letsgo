"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, MouseEventHandler, useState } from "react";
import { createAbsoluteUrl } from "./common-client";
import { Badge } from "./ui/badge";

interface CheckoutProps {
  tenantId: string;
  title: string;
  mode: "payment" | "setup";
}

function Checkout({ tenantId, title, mode }: CheckoutProps) {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [message, setMessage] = useState(
    status === "failure" ? "Failed to process payment. Try again." : undefined
  );
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setProcessing(true);
    const result =
      mode === "payment"
        ? await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: createAbsoluteUrl(`/manage/${tenantId}/subscription`),
            },
          })
        : await stripe.confirmSetup({
            elements,
            confirmParams: {
              return_url: createAbsoluteUrl(
                `/api/proxy/v1/tenant/${tenantId}/paymentmethod`
              ),
            },
          });
    setProcessing(false);
    if (result.error) {
      setMessage(`${result.error.message} Try again.`);
    }
  };

  const handleCancel: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    router.replace(`/manage/${tenantId}/subscription`);
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {message && (
          <div>
            <Badge variant="destructive">{message}</Badge>
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid space-y-4">
          <div>
            <PaymentElement />
          </div>
          <div className="space-x-4">
            <Button disabled={!stripe || !elements || processing}>
              Submit
            </Button>
            <Button
              variant="secondary"
              disabled={processing}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default Checkout;
