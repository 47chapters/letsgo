/**
 * This package consolidates all interactions between LetsGo and Stripe APIs. It provides facility functions specific
 * to the LetsGo use cases which wrap relevant Stripe API calls.
 *
 * @module
 */

import Stripe from "stripe";
import {
  StripeApiVersion,
  StripeTenantIdMetadataKey,
  StripeIdentityIdMetadataKey,
  StripePlanIdMetadataKey,
} from "@letsgo/constants";
import createError from "http-errors";

/**
 * Stripe mode for the API client.
 */
export type StripeMode = "LIVE" | "TEST";

/**
 * Configuration for _live_ or _test_ mode of the Stripe API client.
 */
export interface StripeConfiguration {
  stripeMode: StripeMode;
  secretKey: string;
  publicKey: string;
  webhookKey: string;
}

function getStripeMode(): StripeMode {
  const live = process.env["LETSGO_STRIPE_LIVE_MODE"] === "1";
  const stripeMode = live ? "LIVE" : "TEST";
  return stripeMode;
}

let stripeConfiguration: { [mode: string]: StripeConfiguration };
/**
 * Determine the Stripe configuration based on the environment variables. If the _mode_ parameter is not specified,
 * the mode is selected using the value of the `LETSGO_STRIPE_LIVE_MODE`
 * environment variable. Based on the mode, the configuration will use environment variables specific to the
 * _live_ or _test_ mode to determine the public, secret, and webhook keys for Stripe.
 * @returns
 */
export function getStripeConfiguration(mode?: StripeMode): StripeConfiguration {
  const stripeMode = mode || getStripeMode();
  if (!stripeConfiguration[stripeMode]) {
    const requiredEnvVars = [
      "LETSGO_STRIPE_LIVE_MODE",
      `LETSGO_STRIPE_${stripeMode}_SECRET_KEY`,
      `LETSGO_STRIPE_${stripeMode}_PUBLIC_KEY`,
      `LETSGO_STRIPE_${stripeMode}_WEBHOOK_KEY`,
    ];
    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );
    if (missingEnvVars.length > 0) {
      throw createError(
        418,
        `Stripe is not configured in the API component. Missing required environment variables: ${missingEnvVars.join(
          ", "
        )}.`
      );
    }
    stripeConfiguration[stripeMode] = {
      stripeMode,
      secretKey: process.env[
        `LETSGO_STRIPE_${stripeMode}_SECRET_KEY`
      ] as string,
      publicKey: process.env[
        `LETSGO_STRIPE_${stripeMode}_PUBLIC_KEY`
      ] as string,
      webhookKey: process.env[
        `LETSGO_STRIPE_${stripeMode}_WEBHOOK_KEY`
      ] as string,
    };
  }
  return stripeConfiguration[stripeMode];
}

let stripeClient: Stripe;
function getStripeClient(): Stripe {
  if (!stripeClient) {
    const config = getStripeConfiguration();
    stripeClient = new Stripe(config.secretKey, {
      apiVersion: StripeApiVersion,
    });
  }
  return stripeClient;
}

/**
 * Options for validating incoming Stripe webhooks.
 */
export interface ValidateWebhookEventOptions {
  /**
   * The raw body of the incoming webhook request.
   */
  body: Buffer;
  /**
   * The value of the `Stripe-signature` HTTP request header.
   */
  signature: string;
  /**
   * The mode of the Stripe environment that sent the webhook event.
   */
  mode: StripeMode;
}

/**
 * Validates signature of the incoming webhook event. Returns the event if the signature is valid or throws an error.
 * @param options Options for validating the webhook event.
 * @returns Validated Stripe event.
 */
export async function validateWebhookEvent(
  options: ValidateWebhookEventOptions
): Promise<Stripe.Event> {
  const stripe = getStripeClient();
  const webhookKey = getStripeConfiguration(options.mode).webhookKey;
  const event = stripe.webhooks.constructEvent(
    options.body,
    options.signature,
    webhookKey
  );
  return event;
}

/**
 * Options for creating a new Stripe customer.
 */
export interface CreateCustomerOptions {
  /**
   * LetsGo tenant ID to associate with the Stripe customer.
   */
  tenantId: string;
  /**
   * Identity of the LetsGo user who initiated the transaction to associate with the Stripe customer.
   */
  identityId: string;
  /**
   * Friendly name of the customer in Stripe.
   */
  name?: string;
  /**
   * Email address to associate with the customer in Stripe. This is the e-mail address of form the user profile
   * of the LetsGo user who initiated the transaction, if available.
   */
  email?: string;
}

/**
 * Creates a new Stripe customer.
 * @param options Options for creating a new customer.
 * @returns New Stripe customer.
 */
export async function createCustomer(
  options: CreateCustomerOptions
): Promise<Stripe.Customer> {
  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    name: options.name,
    email: options.email,
    description: `/${options.tenantId}/${options.identityId}`,
    metadata: {
      [StripeTenantIdMetadataKey]: options.tenantId,
      [StripeIdentityIdMetadataKey]: options.identityId,
    },
  });
  return customer;
}

/**
 * Tries to locate a Stripe price using the provided lookup key. The lookup key is the LetsGo plan ID.
 * @param lookupKey Lookup key expected to be associated with a Stripe price. This is the LetsGo plan ID.
 * @returns The Stripe price with the specified lookup key or undefined if not found.
 */
export async function tryGetPrice(
  lookupKey: string
): Promise<Stripe.Price | undefined> {
  const stripe = getStripeClient();
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    expand: ["data.product"],
  });
  return prices.data[0];
}

/**
 * Returns a Stripe price associated with the provided lookup key or throws an exception if none can be found.
 * The lookup key is the LetsGo plan ID.
 * @param lookupKey Lookup key expected to be associated with a Stripe price. This is the LetsGo plan ID.
 * @returns The Stripe price with the specified lookup key.
 */
export async function getPrice(lookupKey: string): Promise<Stripe.Price> {
  const price = await tryGetPrice(lookupKey);
  if (!price) {
    throw new Error(`Stripe price with lookup key '${lookupKey}' not found.`);
  }
  return price;
}

/**
 * Options for creating a new Stripe subscription.
 */
export interface CreateNewSubscriptionOptions {
  /**
   * Stripe customer ID.
   */
  customerId: string;
  /**
   * LetsGo tenant ID to associate with the Stripe subscription.
   */
  tenantId: string;
  /**
   * Identity of the LetsGo user who initiated the transaction to associate with the Stripe subscription.
   */
  identityId: string;
  /**
   * LetsGo plan ID to use as a lookup key to locate a Stripe price to associate with the Stripe subscription.
   */
  priceLookupKey: string;
}

/**
 * Parameters describing a Stripe subscription.
 */
export interface SubscriptionResponse {
  /**
   * Stripe subscription Id.
   */
  subscriptionId: string;
  /**
   * Stripe subscription status.
   */
  status: string;
  /**
   * Date and time when the current subscription period ends.
   */
  currentPeriodEnd: string;
}

function getSubscriptionResponse(
  subscription: Stripe.Subscription
): SubscriptionResponse {
  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
  };
}

/**
 * Parameters describing newly created Stripe subscription.
 */
export interface CreateNewSubscriptionResponse extends SubscriptionResponse {
  /**
   * Client secret for the Stripe payment intent.
   */
  clientSecret: string;
  /**
   * Stripe public key to use for the payment form. This may be a _live_ or _test_ key depending
   * on the Stripe configuration.
   */
  publicKey: string;
}

/**
 * Creates a new Stripe subscription and returns a a client secret representing the Stripe payment intent.
 * This allows the caller to continue the processing the payment for the subscription in the front-end.
 * @param options Options for creating a new Stripe subscription.
 * @returns Parameters describing the newly created Stripe subscription including the payment intent.
 */
export async function createNewSubscription(
  options: CreateNewSubscriptionOptions
): Promise<CreateNewSubscriptionResponse> {
  const stripe = getStripeClient();
  const price = await getPrice(options.priceLookupKey);
  const subscription = await stripe.subscriptions.create({
    customer: options.customerId,
    items: [{ price: price.id, quantity: 1 }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      [StripeTenantIdMetadataKey]: options.tenantId,
      [StripeIdentityIdMetadataKey]: options.identityId,
      [StripePlanIdMetadataKey]: options.priceLookupKey,
    },
    off_session: true,
  });
  const r = {
    ...getSubscriptionResponse(subscription),
    clientSecret: (
      (subscription.latest_invoice as Stripe.Invoice)
        ?.payment_intent as Stripe.PaymentIntent
    )?.client_secret as string,
    publicKey: getStripeConfiguration().publicKey,
  };
  return r;
}

/**
 * Options for creating a new Stripe payment setup to be used when the user needs to update the payment method.
 */
export interface CreateNewPaymentSetupOptions {
  /**
   * Existing Stripe customer ID for whom to create the payment setup.
   */
  customerId: string;
}

/**
 * Parameters describing a newly created Stripe payment setup. This allows the caller to continue
 * the collection of the new payment method in the front-end.
 */
export interface CreateNewPaymentSetupResponse {
  /**
   * Client secret for the Stripe payment intent.
   */
  clientSecret: string;
  /**
   * Stripe public key to use for the payment form. This may be a _live_ or _test_ key depending
   * on the Stripe configuration.
   */
  publicKey: string;
}

/**
 * Creates a new Stripe payment setup to update a customer's payment method and returns a a client secret
 * representing the Stripe payment intent. This allows the caller to continue the processing the payment method update
 * for in the front-end.
 * @param options Options for creating a new Stripe payment setup.
 * @returns Parameters describing the newly created Stripe payment setup including the payment intent.
 */
export async function createNewPaymentSetup(
  options: CreateNewPaymentSetupOptions
): Promise<CreateNewPaymentSetupResponse> {
  const stripe = getStripeClient();
  const setupIntent = await stripe.setupIntents.create({
    customer: options.customerId,
    usage: "off_session",
  });
  return {
    clientSecret: setupIntent.client_secret as string,
    publicKey: getStripeConfiguration().publicKey,
  };
}

/**
 * Options for completing a new Stripe payment setup.
 */
export interface CompletePaymentSetupOptions {
  /**
   * The Stripe setup intent ID that is being completed.
   */
  setupIntentId: string;
  /**
   * The Stripe customer ID for whom the payment setup is being completed for.
   */
  customerId: string;
  /**
   * The Stripe subscription ID to associate with the new payment method.
   */
  subscriptionId: string;
}

/**
 * Information abotu the credit card on file.
 */
export interface CardInfo {
  /**
   * Last four digits of the credit card number.
   */
  last4: string;
  /**
   * The brand of the credit card.
   */
  brand: string;
}

/**
 * Parameters describing the result of a completed Stripe payment setup. If the status is successful, the new
 * credit card information is returned.
 */
export interface CompletePaymentSetupResponse {
  /**
   * Status of the completed Stripe payment setup.
   */
  status: string;
  /**
   * New credit card information if the payment setup was successful.
   */
  card?: CardInfo;
}

/**
 * Completes an update of a payment method for a Stripe subscription. If the update was successful,
 * the new payment method is stored as the default payment method for the customer and the subscription.
 * @param options Options for completing a new Stripe payment setup.
 * @returns Parameters describing the result of a completed Stripe payment setup.
 */
export async function completePaymentSetup(
  options: CompletePaymentSetupOptions
): Promise<CompletePaymentSetupResponse> {
  const stripe = getStripeClient();
  const setupIntent = await stripe.setupIntents.retrieve(
    options.setupIntentId,
    { expand: ["payment_method"] }
  );
  const { status, payment_method: paymentMethod } = setupIntent;
  let card: CardInfo | undefined = undefined;
  if (status === "succeeded" && paymentMethod) {
    const expandedPaymentMethod = paymentMethod as Stripe.PaymentMethod;
    card = expandedPaymentMethod.card && {
      last4: expandedPaymentMethod.card.last4,
      brand: expandedPaymentMethod.card.brand,
    };
    await stripe.subscriptions.update(options.subscriptionId, {
      default_payment_method: expandedPaymentMethod.id,
    });
    await stripe.customers.update(options.customerId, {
      invoice_settings: {
        default_payment_method: expandedPaymentMethod.id,
      },
    });
  }
  return { status, card };
}

/**
 * Options for updating an existing Stripe subscription to change the Stripe price associated with it.
 */
export interface UpdateSubscriptionOptions {
  /**
   * The Stripe subscription ID to update.
   */
  subscriptionId: string;
  /**
   * Identity of the LetsGo user who initiated the transaction to update the Stripe subscription.
   */
  identityId: string;
  /**
   * LetsGo plan ID to use as a lookup key to locate the new Stripe price to associate with the Stripe subscription.
   */
  priceLookupKey: string;
}

/**
 * Changes the Stripe price associated with an existing Stripe subscription.
 * @param options Options for updating an existing Stripe subscription.
 * @returns Updated Stripe subscription.
 */
export async function updateSubscription(
  options: UpdateSubscriptionOptions
): Promise<SubscriptionResponse> {
  const stripe = getStripeClient();
  const price = await getPrice(options.priceLookupKey);
  const subscription = await stripe.subscriptions.retrieve(
    options.subscriptionId
  );
  const updatedSubscription = await stripe.subscriptions.update(
    options.subscriptionId,
    {
      items: [{ id: subscription.items.data[0].id, price: price.id }],
      metadata: {
        [StripePlanIdMetadataKey]: options.priceLookupKey,
        [StripeIdentityIdMetadataKey]: options.identityId,
      },
    }
  );
  return getSubscriptionResponse(updatedSubscription);
}

/**
 * Options for canceling an existing Stripe subscription.
 */
export interface CancelSubscriptionOptions {
  /**
   * The Stripe subscription ID to cancel.
   */
  subscriptionId: string;
  /**
   * Identity of the LetsGo user who initiated the transaction to cancel the Stripe subscription.
   */
  identityId: string;
}

/**
 * Cancels an existing Stipe subscription. The subscription will be canceled at the end of the current billing period,
 * and no refunds will be issued.
 * @param options Options for canceling an existing Stripe subscription.
 * @returns Updated Stripe subscription.
 */
export async function cancelSubscription(
  options: CancelSubscriptionOptions
): Promise<SubscriptionResponse> {
  const stripe = getStripeClient();
  const updatedSubscription = await stripe.subscriptions.update(
    options.subscriptionId,
    {
      cancel_at_period_end: true,
      metadata: {
        [StripeIdentityIdMetadataKey]: options.identityId,
      },
    }
  );
  return getSubscriptionResponse(updatedSubscription);
}

/**
 * Parameters describing a Stripe subscription.
 */
export interface GetSubscriptionResponse extends SubscriptionResponse {
  /**
   * LetsGo plan ID associated with the Stripe subscription.
   */
  planId: string;
  /**
   * Credit card information on file.
   */
  card?: CardInfo;
}

/**
 * Returns a Stripe subscription with the specified ID or `undefined` if it cannot be found.
 * @param subscriptionId Stripe subscription Id.
 * @returns Select parameters of a Stripe subscription with the specified ID or `undefined` if it cannot be found.
 */
export async function getSubscription(
  subscriptionId: string
): Promise<GetSubscriptionResponse | undefined> {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });
  const planId = subscription.metadata[StripePlanIdMetadataKey];
  const paymentMethod =
    subscription.default_payment_method as Stripe.PaymentMethod;
  const last4 = paymentMethod?.card?.last4;
  const brand = paymentMethod?.card?.brand;
  return planId
    ? {
        ...getSubscriptionResponse(subscription),
        planId,
        ...(last4 && brand ? { card: { last4, brand } } : {}),
      }
    : undefined;
}
