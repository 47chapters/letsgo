"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, MouseEventHandler, useState } from "react";
import { createAbsoluteUrl } from "./common-client";

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
              return_url: createAbsoluteUrl(`/manage/${tenantId}/settings`),
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
    router.replace(`/manage/${tenantId}/settings`);
  };

  return (
    <div style={{ maxWidth: "400px" }}>
      <h1>{title}</h1>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <br></br>
        <button disabled={!stripe || !elements || processing}>
          Submit
        </button>{" "}
        <button disabled={processing} onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}
export default Checkout;
