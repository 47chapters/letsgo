"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { PostPaymentMethodResponse } from "@letsgo/types";
import { useEffect } from "react";
import Checkout from "../../../../../components/Checkout";
import { StripeElements } from "../../../../../components/StripeElements";
import { useTenant } from "../../../../../components/TenantProvider";
import { useApiMutate } from "../../../../../components/common-client";

function PaymentMethodUpdate() {
  const { error: userError, user } = useUser();
  const { error: tenantError, currentTenant } = useTenant();
  const {
    error: errorPaymentUpdate,
    data: paymentUpdate,
    trigger: startPaymentUpdate,
  } = useApiMutate<PostPaymentMethodResponse | undefined>({
    path: `/v1/tenant/${currentTenant?.tenantId}/paymentmethod`,
    method: "POST",
  });

  useEffect(() => {
    if (user && currentTenant && !paymentUpdate) {
      startPaymentUpdate();
    }
  }, [user, currentTenant, paymentUpdate, startPaymentUpdate]);

  const error = userError || tenantError || errorPaymentUpdate;
  if (error) throw error;

  if (paymentUpdate) {
    return (
      <StripeElements
        publicKey={paymentUpdate.publicKey}
        clientSecret={paymentUpdate.clientSecret}
      >
        <Checkout
          tenantId={currentTenant?.tenantId as string}
          mode="setup"
          title="New payment details"
        />
      </StripeElements>
    );
  }

  return <div>Loading...</div>;
}

export default PaymentMethodUpdate;
