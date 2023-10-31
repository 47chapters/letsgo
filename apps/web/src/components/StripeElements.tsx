"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRef } from "react";

export type StripeElementsProps = React.PropsWithChildren<{
  publicKey: string;
  clientSecret: string;
}>;

/**
 * Lazily loads the Stripe Elements library which allows the publishable key to be set using environment variables
 * on the server rather than baked into the client code at build time.
 */
export function StripeElements({
  children,
  publicKey,
  clientSecret,
}: StripeElementsProps) {
  const promise = useRef(loadStripe(publicKey));
  return (
    <Elements stripe={promise.current} options={{ clientSecret }}>
      {children}
    </Elements>
  );
}
