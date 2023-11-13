## Run locally

During active development, running the components of your application locally is key to speeding up the change-build-run development cycle. LetsGo makes it easy to run the _web_, _API_, and _worker_ components on your development machine against a DynamoDB database running in AWS:

<img width="914" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/c76e6c20-faeb-471e-9c00-7e7684875aa5">

This article assumes your app has already been [integrated with Auth0 for authentication](../tutorials/setting-up-authentication-with-auth0.md) and [with Stripe for payments](../tutorials/setting-up-payments-with-stripe.md).

### Prerequisities

Before you can run your app locally, you must make sure that the DynamoDB database already exists in the cloud, and that the local components are configured.

If you have integrated your app with [Stripe](../tutorials/setting-up-payments-with-stripe.md) or [Auth0](../tutorials/setting-up-authentication-with-auth0.md), the DynamoDB database has already been created in the course of the many deployments to AWS. For completeness, however, the simplest way to ensure that the DynamoDB database exists is to make the [first deployment to AWS](../tutorials/first-deployment-to-aws.md).

Each of the _web_, _API_, and _worker_ components requires different configuration settings to run locally. They are described in the following sections.

#### The _web_ configuration

Create the `apps/web/.env.local` file with the following configuration settings:

```bash
LETSGO_DEPLOYMENT=main
LETSGO_WEB_URL=http://localhost:3000
LETSGO_API_URL=http://localhost:3001
LETSGO_LOCAL_QUEUE_URL=http://localhost:3002
AUTH0_ISSUER_BASE_URL=https://{auth0-domain}
AUTH0_AUDIENCE=letsgo:service
AUTH0_SCOPE=openid profile email offline_access
AUTH0_BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID={auth0-client-id}
AUTH0_CLIENT_SECRET={auth0-client-secret}
AUTH0_SECRET={auth0-secret}
```

The placeholder values for the last three `AUTH0_*` settings have been established when you [integrated with Auth0 to enable authentication](../tutorials/setting-up-authentication-with-auth0.md).

#### The _API_ configuration

Create the `apps/api/.env` file with the following configuration settings:

```bash
LETSGO_DEPLOYMENT=main
LETSGO_WEB_URL=http://localhost:3000
LETSGO_API_URL=http://localhost:3001
LETSGO_LOCAL_QUEUE_URL=http://localhost:3002
LETSGO_STRIPE_LIVE_MODE=0
LETSGO_STRIPE_TEST_PUBLIC_KEY={test-mode-publishable-key}
LETSGO_STRIPE_TEST_SECRET_KEY={test-mode-secret-key}
LETSGO_STRIPE_TEST_WEBHOOK_KEY={test-mode-cli-webhook-signing-secret}
```

The placeholder values for the last three `LETSGO_STRIPE_*` setting have been establied when you [integrated with Stripe to process payments](../tutorials/setting-up-payments-with-stripe.md).

The configuration above allows you to execute all payment-related operations in Stripe's _test mode_, which means no money is changing hands. This is the recommended way to run your app locally during development and testing. However, there may be situations when you want to execute final tests against Stipe's _live mode_. In this case, the configuration must contain additional settings:

```bash
LETSGO_DEPLOYMENT=main
LETSGO_WEB_URL=http://localhost:3000
LETSGO_API_URL=http://localhost:3001
LETSGO_LOCAL_QUEUE_URL=http://localhost:3002
LETSGO_STRIPE_LIVE_MODE=1
LETSGO_STRIPE_TEST_PUBLIC_KEY={test-mode-publishable-key}
LETSGO_STRIPE_TEST_SECRET_KEY={test-mode-secret-key}
LETSGO_STRIPE_TEST_WEBHOOK_KEY={test-mode-cli-webhook-signing-secret}
LETSGO_STRIPE_LIVE_PUBLIC_KEY={live-mode-publishable-key}
LETSGO_STRIPE_LIVE_SECRET_KEY={live-mode-secret-key}
LETSGO_STRIPE_LIVE_WEBHOOK_KEY={live-mode-cli-webhook-signing-secret}
```

Notice the addition of the three configuraiton settings with live mode keys for Stripe: `LETSGO_STRIPE_LIVE_*`. In addition, notice the `LETSGO_STRIPE_LIVE_MODE=1` entry. Setting `LETSGO_STRIPE_LIVE_MODE` to `1` causes the _API_ component to use the Stripe live mode keys from the `LETSGO_STRIPE_LIVE_*` properties. If `LETSGO_STRIPE_LIVE_MODE` is set to any value other than `1` or not set at all, the test mode Stripe keys from the `LETSGO_STRIPE_TEST_*` properties are used instead.

#### The _worker_ configuration

Create the `apps/worker/.env` file with the following configuration settings:

```bash
LETSGO_DEPLOYMENT=main
LETSGO_WEB_URL=http://localhost:3000
LETSGO_API_URL=http://localhost:3001
LETSGO_LOCAL_QUEUE_URL=http://localhost:3002
```

These settings allow the code you write in the _worker_ component to call the _API_ endpoints as well as enqueue new, asynchronous work for itself using the [@letsgo/queue](../reference/letsgo-queue.md) package.

In some situations, the worker may need to call Stripe using the [@letsgo/stripe](../reference/letsgo-stripe.md) package. In this case, you must provide the same set of Stripe-related configuration settings to the _worker_ as you did for the _API_ component. In the most general case:

```bash
LETSGO_DEPLOYMENT=main
LETSGO_WEB_URL=http://localhost:3000
LETSGO_API_URL=http://localhost:3001
LETSGO_LOCAL_QUEUE_URL=http://localhost:3002
LETSGO_STRIPE_LIVE_MODE=1
LETSGO_STRIPE_TEST_PUBLIC_KEY={test-mode-publishable-key}
LETSGO_STRIPE_TEST_SECRET_KEY={test-mode-secret-key}
LETSGO_STRIPE_TEST_WEBHOOK_KEY={test-mode-cli-webhook-signing-secret}
LETSGO_STRIPE_LIVE_PUBLIC_KEY={live-mode-publishable-key}
LETSGO_STRIPE_LIVE_SECRET_KEY={live-mode-secret-key}
LETSGO_STRIPE_LIVE_WEBHOOK_KEY={live-mode-cli-webhook-signing-secret}
```

### Run your app locally

There are two steps, and you need two terminal windows.

In the first terminal window, go to the `apps/api` directory and run:

```bash
yarn stripe
```

This will tunnel Stripe webhook events generated by Stripe to the local http://localhost:3001/v1/stripe/webhook endpoint.

In the second terminal window, go to the root of your project and run:

```bash
yarn dev
```

This will:

- Rebuild anythng that needs rebuilding.
- Run the _web_ component as a plain Node.js HTTP server listening on http://localhost:3000. You can navigate to it in the browser.
- Run the _API_ component as a plain Node.js HTTP server listening on http://localhost:3001. You can call `curl http://localhost:3001/v1/health` to get the health information.
- Run the _worker_ component as a plain Node.js HTTP server listening on http://localhost:3002. You can use the [@letsgo/queue](../reference/letsgo-queue.md) package to enqueue work for it from the code of the _API_ or _worker_ components.
- Watch for any changes in the file system of these components _and its dependencies_, and rebuild and restart the components as necessary.
- For the _web_ component, the _fast refresh_ mechanims is used that immediately reflects any changes in the code of the _web_ component without the need to refresh the browser window.

**NOTE** Unlike in the cloud, there is no queue in front of the _worker_ component when running locally. Any events "enqueued" for the worker using the [@letsgo/queue](../reference/letsgo-queue.md) package will be immediately passed to the worker to process using the lightweight HTTP server listening on http://localhost:3002. This means there is no fidelity with any of the scalability/throttling/failure behaviors you would expect if the queue were present. In particular, events that fail during processing are dumped as opposed to being re-tried or sent to a dead letter queue.

### Run individual components

Instead of running _web_, _API_, and _worker_ components at once using `yarn dev` from the root directory of your project, you can run components individually. To do this, go to the `apps/web`, `apps/api`, or `apps/worker` directory, and run `yarn dev` from there to start the respective component.

The reason you may prefer this method is to isolate the console output of the individual components into separate terminal windows for readability.

### Production vs development

Note that the _web_, _API_, and _worker_ components running locally are using the DynamoDB database in AWS. While it is acceptable during the initial development of your app, once you move to production and have live customers, you will want to isolate production workloads from development activities. See how to [manage multiple deployments](./manage-multiple-deployments.md) to address this issue.
