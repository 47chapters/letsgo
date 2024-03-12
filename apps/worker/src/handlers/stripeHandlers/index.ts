import { sendSlackMessage } from "@letsgo/slack";
import { MessageHandler } from "..";
import { invoicePaid } from "./invoicePaid";
import { StripeMode } from "@letsgo/stripe";

export interface StripeMessage<T> {
  type: string;
  data: {
    object: T;
  };
  stripeMode: StripeMode;
  [key: string]: any;
}

export const unrecognizedStripeMessageTypeHandler: MessageHandler<
  StripeMessage<any>
> = async (message, event, context) => {
  console.log(
    `UNSUPPORTED ${message.stripeMode} STRIPE MESSAGE TYPE, IGNORING`,
    JSON.stringify(message, null, 2)
  );
  await sendSlackMessage(
    `:credit_card: [${message.stripeMode}] Worker received an unsupported Stripe webhook (ignoring): *${message.type}*`
  );
};

/**
 * Implementation of the Stripe subscription lifecycle events. For event types and descriptions
 * see https://stripe.com/docs/billing/subscriptions/overview#subscription-events
 */
export const handlers: { [type: string]: MessageHandler<StripeMessage<any>> } =
  {
    ["customer.created"]: unrecognizedStripeMessageTypeHandler,
    ["customer.subscription.created"]: unrecognizedStripeMessageTypeHandler,
    ["customer.subscription.deleted"]: unrecognizedStripeMessageTypeHandler,
    ["customer.subscription.paused"]: unrecognizedStripeMessageTypeHandler,
    ["customer.subscription.resumed"]: unrecognizedStripeMessageTypeHandler,
    ["customer.subscription.trial_will_end"]:
      unrecognizedStripeMessageTypeHandler,
    ["customer.subscription.updated"]: unrecognizedStripeMessageTypeHandler,
    ["invoice.created"]: unrecognizedStripeMessageTypeHandler,
    ["invoice.finalized"]: unrecognizedStripeMessageTypeHandler,
    ["invoice.finalization_failed"]: unrecognizedStripeMessageTypeHandler,
    ["invoice.paid"]: invoicePaid,
    ["invoice.payment_action_required"]: unrecognizedStripeMessageTypeHandler,
    ["invoice.payment_failed"]: unrecognizedStripeMessageTypeHandler,
    ["invoice.upcoming"]: unrecognizedStripeMessageTypeHandler,
    ["invoice.updated"]: unrecognizedStripeMessageTypeHandler,
    ["payment_intent.created"]: unrecognizedStripeMessageTypeHandler,
    ["payment_intent.succeeded"]: unrecognizedStripeMessageTypeHandler,
    ["subscription_schedule.aborted"]: unrecognizedStripeMessageTypeHandler,
    ["subscription_schedule.canceled"]: unrecognizedStripeMessageTypeHandler,
    ["subscription_schedule.completed"]: unrecognizedStripeMessageTypeHandler,
    ["subscription_schedule.created"]: unrecognizedStripeMessageTypeHandler,
    ["subscription_schedule.expiring"]: unrecognizedStripeMessageTypeHandler,
    ["subscription_schedule.released"]: unrecognizedStripeMessageTypeHandler,
    ["subscription_schedule.updated"]: unrecognizedStripeMessageTypeHandler,
  };
