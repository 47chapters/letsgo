## Manage the pricing model and Stripe integration

LetsGo boilerplate contains elements that facilitate creating subscription-based pricing models for your app, with actual subscriptions handled by Stripe. The scaffolding in place includes:

- A declarative pricing plan definition that drives the generation of the pricing page UI in the _web_ component and subscription management in Stripe.
- Support for changing and canceling plans by tenants.
- Management of the subscription lifecycle using Stripe webhooks and the _worker_ component.

This article assumes you have already followed the [set up payments with Stripe](../tutorials/setting-up-payments-with-stripe.md) tutorial.

### What is a pricing plan

A pricing plan in LetsGo declaratively describes the subscription plans you want to present to your users. Think of a "plan" as one column on your `/pricing` page, and the "pricing plan" as the collection of those plans:

<img width="1312" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/d33b7ef3-92fc-4c07-bb36-9f75a432df4f">

There are three types of plans in LetsGo:

1. **Free plans**. These plans are automatically handled by LetsGo and do not require customer's payment. Customers may simply switch to this plan. Any _freemium_ plan falls in this category, and it is a natural plan to start new customers on. You would usually have just one such plan.
1. **Stripe plans**. These plans require payment by customers and are represented in Stripe as a [Stripe subscription](https://stripe.com/docs/billing/subscriptions/overview), typically with a monthly or annual payment cycle.
1. **Custom plans**. This is a plan that requires customer's contact with your sales team. In LetsGo, a customer choosing this plan is redirected to the contact form they are asked to fill out. Handling of that plan is not automated by LetsGo in any other way.

For the plans handled by Stripe, a LetsGo plan corresponds to the concept of a [Stripe price](https://stripe.com/docs/products-prices/how-products-and-prices-work) in that it implies a choice a Stripe product and a specific way of billing for this product. For example, a SaaS subscription of the same product that can be purchased with either an annual or monthly billing cycle is modeled in LetsGo as two separate LetsGo plans, while in Stripe it is modeled as a single product with two prices.

### Pricing plan definition

The pricing plan of your app is defined in the `@letsgo/pricing` package, specifically in [packages/pricing/src/index.ts](../../packages/pricing/src/index.ts):

```typescript
export const Plans: Plan[] = [
  {
    planId: "free",
    active: true,
    name: "Free",
    descripton: "Development",
    features: ["2 blips / second", "10 blaps", "Community support"],
    usesStripe: false,
    price: "free forever",
  },
  {
    planId: "starter",
    active: true,
    name: "Starter",
    descripton: "Get going",
    features: ["10 blips / second", "200 blaps", "Community support"],
    usesStripe: true,
    price: "$10 / month",
  },
  {
    planId: "business",
    active: true,
    name: "Business",
    descripton: "Enable growth",
    features: [
      "100 blips / second",
      "5000 blaps",
      "Support Center",
      "Integrations",
    ],
    usesStripe: true,
    price: "$90 / month",
  },
  {
    planId: "custom",
    active: true,
    name: "Contact Us",
    descripton: "White glove treatment",
    features: [
      "Custom blips / second",
      "Custom blaps",
      "Premium support",
      "Integrations",
      "Data residency",
      "SLA",
    ],
    usesStripe: false,
    actionUrl: "/contact",
    actionVerb: "Contact Us",
    price: "custom contract",
  },
];
```

Each element of the array defines one plan as follows:

- `planId` is a string that uniquely identifies your plan in the system, and is the basis for correlating the LetsGo pricing plan with a Stripe price. Once set, you should never change the `planId`. Never reuse the same `planId` if you decide to discontinue it in the future.
- `name` is the name of the plan to be used in the UI.
- `description` is a brief description to be used inthe UI.
- `features` is an array of string features to be used in the UI.
- `price` is a string representation of the price (and billing cycle) to be used in the UI. This description does not drive actual billing - this is done by the Stripe price you need to create in Stripe itself that corresponds to this pricing plan in LetsGo.
- `active` indicates whether the plan is active. Only active plans are offered to customers who are just signing up or are switching from another plan. If at some point you want to discontine a specific plan, never remove it from the collection but instead mark it `active = false`. You need to keep the discontinued plans around because you may have existing customers who signed up to it and are billed for it by Stripe. You can only physically remove a plan from the collection if you are sure there are no existing customers signed up to it, which is dependent on your treatment of existing customers when your pricing model changes.
- `usesStripe` indicates whether this is a paid plan that should be handled by Stripe. LetsGo provides a lot of the scaffolding for managing the lifecycle of a Stripe subscription for such plans. More on this below.
- `actionUrl` tells custom plans where to redirect the user who chooses this plan on the pricing page. By default it is the contact form.
- `actionVerb` is the text that drives the UI on the pricing page for this plan. In the boilerplate it is the text on the button used for plan selection.

When you make a change in the pricing plan definition in [packages/pricing/src/index.ts](../../packages/pricing/src/index.ts) and restart the app, you will see the `/pricing` page of the _web_ component reflecting the new, active pricing plans.

### Stripe configuraiton

For each Stripe plan you defined in [packages/pricing/src/index.ts](../../packages/pricing/src/index.ts), you must ensure a corresponding Product/Price definition exists in Stripe. Follow the instructions for [configuring products and prices](../tutorials/setting-up-payments-with-stripe.md#configure-products-and-prices-in-stripe) to complete this step.

### Tenants and plans

Every tenant in LetsGo is assigned to a specific pricing plan at all times.

When a tenant is newly created (e.g. for a user who logs in and does not have access to any other tenant yet), it is assigned the so called _default_ plan defined in the `DefaultPlanId` export from `@letsgo/pricing` at [packages/pricing/src/index.ts](../../packages/pricing/src/index.ts). It is common for the default plan to be a freemium plan.

Tenants in LetsGo are described with the following interface:

```typescript
export interface Tenant extends DBItem {
  tenantId: string;
  displayName: string;
  createdAt: string;
  createdBy: Identity;
  updatedAt: string;
  updatedBy: Identity;
  deletedAt?: string;
  deletedBy?: Identity;
  plan: SubscriptionPlan;
}
```

Notice the `plan` property which describes the pricing plan information. The `SubscriptionPlan` has the following definition:

```typescript
export interface SubscriptionPlan {
  planId: string;
  stripeCustomerId?: string;
  stripeSubscription?: {
    subscriptionId: string;
    status: string;
    currentPeriodEnd: string;
    card?: CardInfo;
  };
  changes: SubscriptionPlanChange[];
}

export interface SubscriptionPlanChange {
  timestamp: string;
  updatedBy: Identity;
  newPlanId: string | null;
}
```

This is the meaning of individual properties of `SubscriptionPlan`:

- `planId` is the pricing plan the tenant is assigned to at present.
- `stripeCustomerId` is the customer Id of a Stripe customer representing this tenant. It is present if the tenant is currently on a Stripe plan, or was on a Strip plan at one point in the past. If the tenant switches back to a paid Stripe plan in the future, the same Stripe customer will be used.
- `stripeSubscription` is present if the customer is currently on a Stripe plan.
- `stripeSubscription.subscriptionId` is the Stripe subscription Id.
- `stripeSubscription.status` is the status of the Stripe subscription. The value of `active` means the customer is in good standing (the payments are current). See [other possible states](https://stripe.com/docs/billing/subscriptions/overview#subscription-statuses).
- `stripeSubscription.currentPeriodEnd` is a date indicating the last day of the current billing cycle.
- `stripeSubscription.card` if the customer is using a credit card to pay for the subscription, this will contain the type of the card they are using and the last four digits, which you can use to display payment information in the UI.
- `changes` is an array containing the entire history of changes of pricing plans for the tenant.

In the _web_ component, you can access the list of tenants the logged in user has access to as well as the current tenant using the [_useTenant_ hook](./develop-the-frontend.md#get-tenants-and-current-tenant). In the _API_ and _worker_ components, you can use the `getTenant` function exposed by the [@letsgo/tenant](../reference/letsgo-tenant/README.md) package to access a specific tenant. When calling the _API_, you can use the `GET /v1/me` endpoint to find out the list of tenants the caller has access to, based on the identity information from their access token.

### Related topics

[Setting up payments with Stripe](../tutorials/setting-up-payments-with-stripe.md)  
[Tenants and users](../backgound/tenants-and-users.md)  
[@letsgo/tenant](../reference/letsgo-tenant/README.md)  
[@letsgo/pricing](../reference/letsgo-pricing/README.md)
