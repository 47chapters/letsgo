## Setting up payments with Stripe

In this tutorial, you will integrate with Stripe to automate subscription payments in your app. You will define your subscription-based pricing plans and set up corresponding Stripe products and prices. At the end of this tutorial, users of your app will be able to sign up for a specific subscription directly from your pricing page, switch between pricing plans after signup, and update their payment methods.

<img width="1320" alt="LetsGo Web - Pricing" src="https://github.com/47chapters/letsgo/assets/822369/9dc6b58c-ce0d-47f0-9227-f7a14dab62a2">

This tutorial assumes you have already [set up authentication with Auth0](setting-up-authentication-with-auth0.md) since all dashboard interactions that involve subscriptions happen in the context of an authenticated application user.

Now, let's get paid!

### Sign up to Stripe

We are using Stripe as the payment processing and subscription management platform. If you don't have a Stripe account, you can create one [here](https://dashboard.stripe.com/register).

### Install Stripe CLI

We use Stripe CLI to tunnel webhook events related to payment and subscription lifecycle to your locally running application. Follow the instructions [here](https://stripe.com/docs/stripe-cli) to install and set up the Stripe CLI.

### Collect the API keys from Stripe

For the purpose of this tutorial, we exclusively use Stripe's test mode intended for development and testing. Stripe's test mode does not affect the flow of actual money and has its own set of API keys separate from production. Setting up the live Stripe environment generally follows the same steps, except where indicated.

You will need three keys: _publishable key_, _secret key_, and the _webhook signing secret_.

You can access the _publishable key_ and _secret \_key_ for Stripe's test mode from [Test Mode API Keys](https://dashboard.stripe.com/test/apikeys) section of the Stripe dashboard.

### Registering a Stripe webhook

To access the _webhook signing secret_, you must first register a new webhook endpoint with Stripe:

1. Determine the base URL of your _API_ server running in AWS by executing `yarn ops status -a api`. The _Url_ property contains the _API_ base URL.
1. Go to the [Test Mode Webhooks](https://dashboard.stripe.com/test/webhooks) page of the Stripe's dashboard and choose _Add endpoint_ in the _Hosted endpoints_ section.
1. In the _Endpoint URL_, enter `{base-url}/v1/stripe/webhook/test`, where `{base-url}` is the _API_ base URL you determined above (**NOTE** when setting up live Stripe environment, you need to enter `{base-url}/v1/stripe/webhook/live` for the _Endpoint URL_).
1. Click _Select events_ and check the checkbox next to _select all events_. Then click _Add events_.
1. Back on the previous screen, click _Add endpoint_.
1. You will now see a page with the status of the endpoint. Click _Reveal_ under _Signing secret_. Take note of this _webhook signing secret_, its value starts with `whsec_`.

### Configure Stripe in the local environment

When running your app locally, we will be receiving Stripe webhooks generated in the cloud using a tunnel established with the Stripe CLI. This tunnel uses a different _webhook signing secret_ than the secret collected for the public webhook endpoint in the previous step. To obtain the Stripe CLI _webhook signing secret_, run the following command:

```bash
stripe listen --print-secret
```

Take note of the `whsec_...` value that is printed out.

Then, add the following environment variables to the `apps/api/.env` file in your project:

```bash
cat >> apps/web/.env.local <<EOF
LETSGO_STRIPE_LIVE_MODE=0
LETSGO_STRIPE_TEST_PUBLIC_KEY={publishable-key}
LETSGO_STRIPE_TEST_SECRET_KEY={secret-key}
LETSGO_STRIPE_TEST_WEBHOOK_KEY={cli-webhook-signing-secret}
EOF
```

Remember to substitute the _publishable key_, _secret key_, and the _webhook signing secret_ obtained from the Stripe CLI above for `{publishable-key}`, `{secret-key}`, and `{cli-webhook-signing-secret}`, respectively.

**NOTE** When setting up live Stripe environment, you need to set the `LETSGO_STRIPE_LIVE_PUBLIC_KEY`, `LETSGO_STRIPE_LIVE_SECRET_KEY`, and `LETSGO_STRIPE_LIVE_WEBHOOK_KEY` configuration settings instead.

### Configure Stripe in AWS

Run the following commands to configure Stripe for the deployed version of your app in AWS:

```bash
yarn ops config set LETSGO_STRIPE_LIVE_MODE=0
yarn ops config set LETSGO_STRIPE_TEST_PUBLIC_KEY={publishable-key}
yarn ops config set LETSGO_STRIPE_TEST_SECRET_KEY={secret-key}
yarn ops config set LETSGO_STRIPE_TEST_WEBHOOK_KEY={cloud-webhook-signing-secret}
```

Remember to substitute the _publishable key_, _secret key_, and the _webhook signing secret_ obtained when adding a webhook endpoint in the Stripe dashboard for `{publishable-key}`, `{secret-key}`, and `{cloud-webhook-signing-secret}`, respectively. The `{cloud-webhook-signing-secret}` is the _webhook signing secret_ obtained when [registering a Stipe webook](#registering-a-stripe-webhook) previously.

**NOTE** When setting up live Stripe environment, you need to set the `LETSGO_STRIPE_LIVE_PUBLIC_KEY`, `LETSGO_STRIPE_LIVE_SECRET_KEY`, and `LETSGO_STRIPE_LIVE_WEBHOOK_KEY` configuration settings instead.

For those configuration changes to take effect, you need to re-deploy your application with:

```bash
yarn ops deploy -a api
```

**NOTE** It is sufficient to only deploy the _API_ component as this is the only place where the new Stripe settings are used.

### Determine your subscription plans

Inspect the [packages/pricing/src/index.ts](../../packages/pricing/src/index.ts) file and locate the `Plans` export:

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

This is where your application defines the pricing plans that show up on the `/pricing` page and your customers can choose from. There are four pricing plans above, but only two of them, marked with `usesStripe: true`, have their billing automated through Stripe. One is a _Starter_ plan for $10/month, and the other a _Business_ plan for $90/month. We won't be modifying this pricing structure in this tutorial. Instead, take note of the `planId` values for the two plans (`starter` and `business`, respectively) as we will need them to configure corresponding concepts in Stripe.

### Configure products and prices in Stripe

You will now create a product and a price in Stripe for every LetsGo pricing plan you defined in the previous step which you want to be handled by Stripe.

Go to the [Test Mode Product Catalog](https://dashboard.stripe.com/test/products?active=true) in Stripe, and click _Add product_.

<img width="767" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/c2bfa789-ed4d-4f19-a194-8f4b8462ec19">

Enter _Starter_ as the _Name_ of the first product. Enter _10_ in the _Amount_ field. Make sure the currency is set to _USD_ and the _Recurring_ mode is selected. Make sure _Billing period_ is set to _monthly_.

Now click on the _Advanced pricing options_, scroll down to the _Additional_ section, and enter the LetsGo `planId` value of _starter_ into the _Lookup key_ field. Click _Next_, then _Add product_.

Then repeat this process to add a second product, entering _Business_, _90_, and _business_ for _Name_, _Amount_, and _Lookup key_, respectively.

**IMPORTANT** The value of Stripe's _Lookup key_ must match exactly the value of `planId` of the corresponding plan defined in LetsGo. This is how LetsGo correlates a LetsGo plan with Stripe's product and price.

When you are done defining products in Stripe, your list of products should be similar to this:

<img width="1312" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/261a65d6-2b80-4c72-b414-d2db680731aa">

### Subscribe to a paid plan in test mode locally

To test the Stripe integration locally, you will sign up for the _Business_ plan at $90/month. Since you are using Stripe's test mode, no money is going to change hands and you will be able to use a fake credit card number.

First, run the application locally with:

```bash
yarn dev
```

Then, navigate to `http://localhost:3000` in the browser, and click on the _Pricing_ link in the navbar. You should see your pricing page, driven by the content of the [packages/pricing/src/index.ts](../../packages/pricing/src/index.ts) file:

<img width="1320" alt="LetsGo Web - Pricing" src="https://github.com/47chapters/letsgo/assets/822369/9dc6b58c-ce0d-47f0-9227-f7a14dab62a2">

If you are already logged in to the web application, you will see a slightly different view:

<img width="1320" alt="LetsGo Web - Pricing Authenticated" src="https://github.com/47chapters/letsgo/assets/822369/68f5a143-8166-4f1d-a10f-413ecfd9f4fc">

For authenticated users, the current plan they are on is highlighted, and the pricing page allows them to switch to a different plan.

Either way, click on the _Get Started_ or _Select_ button for the _Business_ plan. You should be brought to the payment page (if you are logged in when selecting the Business plan, you will see an interim screen to confirm the intended change of subscription plans):

<img width="1320" alt="LetsGo Web - Payment Details" src="https://github.com/47chapters/letsgo/assets/822369/53a7bec1-cd75-4747-bb78-1ebfc32d1588">

Since you are using Stripe's test mode, we will use fake credit card information. Enter _5555 5555 5555 4444_ as the credit card number, some future date for expiration, _123_ for SVC, and 98053 for the ZIP code (if the country is set to US). Click _Submit_.

After a successful charge of $90 to the fake credit card, you will be redirected to the subscription settings page of the dashboard. The page shows the current plan, payment status, payment method, and the billing cycle:

<img width="1320" alt="LetsGo Web - Subscription" src="https://github.com/47chapters/letsgo/assets/822369/4e2c36f4-4804-444f-a545-4c3e6080a49d">

From the tenant settings screen, you can also initiate a change of the subscription plan or an update of the payment method on file.

### Test the subscription plan change flow in AWS

Now let's go through the flow of changing the subscription plan using your app deployed to AWS.

First, find out the public URL of your website by running:

```bash
yarn ops status -a web
```

Navigate in the browser to the URL returned as the _Url_ property from the command above. If you are not logged in, click _Login_ and complete the Auth0 login flow. Then, click on the _Subscription_ link in the dropdown menu behind your avatar to go to the subscription management page:

<img width="1320" alt="LetsGo Web - Subscription" src="https://github.com/47chapters/letsgo/assets/822369/4e2c36f4-4804-444f-a545-4c3e6080a49d">

Notice your tenant is already on the _Business_ plan. This is because the local and cloud versions of the application are sharing the database running in the cloud, and the same Stripe subscription.

Click _Change plan_ to be brought to a new plan selection page:

<img width="1378" alt="LetsGo Web - Change Plan" src="https://github.com/47chapters/letsgo/assets/822369/569fc954-965b-4249-9163-b14e41b61d63">

Notice that _Business_ is highlighted as your current plan. Click _Select_ under the _Starter_ plan for $10/month. You will then be asked for a confirmation of the new plan selection:

<img width="1378" alt="LetsGo Web - Plan Change Confirmation" src="https://github.com/47chapters/letsgo/assets/822369/ea4f47ec-ec77-471d-acf1-bf34999b3872">

Once you confirm the switch, you will be brought back to the tenant settings page which shows your new _Starter_ plan as current:

<img width="1378" alt="LetsGo Web - Plan After Change" src="https://github.com/47chapters/letsgo/assets/822369/e5b44b2b-04bd-406d-8a14-b8abe05fadac">

Notice you were not asked for payment information in this process. This is because Stripe already has your payment information on file if you are switching from one paid plan to another.

### Confirm the subscription status in Stripe

Navigate to the [Test Mode Subscription Page](https://dashboard.stripe.com/test/subscriptions) in Stripe and confirm the _Starter_ subscription is in fact active:

<img width="1268" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/5a710ec1-af5c-45da-89f2-842220a1399a">

When you click on subscription details, you can inspect many aspects of this subscription that go beyond the scope of this tutorial. One element to highlight here is the _Metadata_ section:

<img width="1312" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/6bfe9aef-005c-49a6-995b-c401743b6a9e">

Notice it contains the LetsGo _tenantId_ this subscription belongs to, the LetsGo _planId_, as well as the _identityId_ of the user who activated this subscription. This _identityId_ can be traced back to a specific Auth0 user.

Congratulations! You have successfully integrated Stripe into your app and are ready to present your customers with a subscription-based pricing model. With authentication and payments set up, one other tutorial to explore is related to [configuring a custom domain](configuring-custom-domain.md) for your _web_ and _API_ components.
