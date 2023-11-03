import Stripe from "stripe";
import {
  StripeApiVersion,
  StripeTenantIdMetadataKey,
  StripeIdentityIdMetadataKey,
  StripePlanIdMetadataKey,
} from "@letsgo/constants";
import createError from "http-errors";

export interface StripeConfiguration {
  stripeMode: "LIVE" | "TEST";
  secretKey: string;
  publicKey: string;
  webhookKey: string;
}

function getStripeMode() {
  const live = process.env["LETSGO_STRIPE_LIVE_MODE"] === "1";
  const stripeMode = live ? "LIVE" : "TEST";
  return stripeMode;
}

let stripeConfiguration: StripeConfiguration;
export function getStripeConfiguration(): StripeConfiguration {
  if (!stripeConfiguration) {
    const stripeMode = getStripeMode();
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
    stripeConfiguration = {
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
  return stripeConfiguration;
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

export interface ValidateWebhookEventOptions {
  body: Buffer;
  signature: string;
}

export async function validateWebhookEvent(
  options: ValidateWebhookEventOptions
): Promise<Stripe.Event> {
  const stripe = getStripeClient();
  const webhookKey = getStripeConfiguration().webhookKey;
  const event = stripe.webhooks.constructEvent(
    options.body,
    options.signature,
    webhookKey
  );
  return event;
}

export interface CreateCustomerOptions {
  tenantId: string;
  identityId: string;
  name?: string;
  email?: string;
}

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

export async function getPrice(lookupKey: string): Promise<Stripe.Price> {
  const price = await tryGetPrice(lookupKey);
  if (!price) {
    throw new Error(`Stripe price with lookup key '${lookupKey}' not found.`);
  }
  return price;
}

export interface CreateNewSubscriptionOptions {
  customerId: string;
  tenantId: string;
  identityId: string;
  priceLookupKey: string;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  status: string;
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

export interface CreateNewSubscriptionResponse extends SubscriptionResponse {
  clientSecret: string;
  publicKey: string;
}

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
  return {
    ...getSubscriptionResponse(subscription),
    clientSecret: (
      (subscription.latest_invoice as Stripe.Invoice)
        ?.payment_intent as Stripe.PaymentIntent
    )?.client_secret as string,
    publicKey: getStripeConfiguration().publicKey,
  };
}

export interface CreateNewPaymentSetupOptions {
  customerId: string;
}

export interface CreateNewPaymentSetupResponse {
  clientSecret: string;
  publicKey: string;
}

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

export interface CompletePaymentSetupOptions {
  setupIntentId: string;
  customerId: string;
  subscriptionId: string;
}

export interface CardInfo {
  last4: string;
  brand: string;
}

export interface CompletePaymentSetupResponse {
  status: string;
  card?: CardInfo;
}

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

export interface UpdateSubscriptionOptions {
  subscriptionId: string;
  identityId: string;
  priceLookupKey: string;
}

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

export interface CancelSubscriptionOptions {
  subscriptionId: string;
  identityId: string;
}

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

interface GetSubscriptionResponse extends SubscriptionResponse {
  planId: string;
  card?: CardInfo;
}

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
