import { sendSlackMessage } from "@letsgo/slack";
import { StripeMessage } from ".";
import { MessageHandler } from "..";
import Stripe from "stripe";
import { StripeTenantIdMetadataKey } from "@letsgo/constants";

export const invoicePaid: MessageHandler<
  StripeMessage<Stripe.Invoice>
> = async (message, event, context) => {
  const o = message.data.object;
  await sendSlackMessage(
    [
      `:boom::moneybag: You've got paid *${o.currency.toUpperCase()} ${Math.round(
        o.amount_paid / 100
      ).toFixed(2)}*`,
      `*Subscription Id:* ${o.subscription}`,
      `*Tenant Id:* ${
        o.subscription_details?.metadata?.[StripeTenantIdMetadataKey] ||
        "unknown"
      }`,
    ].join("\n")
  );
};
