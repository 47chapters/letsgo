## Develop the API

The _API_ component of the LetsGo boilerplate implements the HTTP APIs your application exposes. This includes APIs that are consumed from the _web_ component, as well as APIs designed to be called by your customer or partner applications.

<img width="831" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/e6787a3a-a1f6-47be-bf95-d19166494b67">

This article assumes you have [integrated with Auth0 to enable user authentication](../tutorials/setting-up-authentication-with-auth0.md) and [integrated with Stripe to process payments](../tutorials/setting-up-payments-with-stripe.md).

### Technology

The _API_ component is an [Express](https://expressjs.com/) server implemented in [TypeScript](https://www.typescriptlang.org/).

The boilerplate LetsGo provides includes endpoints required for tenant and user management, support for managing the lifecycle of Stripe subscriptions, including processing of Stripe webhooks, and support for contact form submissions from the _web_ component.

In the course of development of your app, you will be adding new routes to the server to expose the HTTP APIs specific to your application.

When [running locally](./run-locally.md), the _API_ component is hosted as a plain [Node.js](https://nodejs.org/) http server on `http://localhost:3001`.

When you [deploy your app to AWS](../tutorials/first-deployment-to-aws.md), the _API_ component is packaged as a [Docker](https://www.docker.com/) image and deployed using [AWS App Runner](https://aws.amazon.com/apprunner/).

### Location

The _API_ code is located in the `apps/api` directory.

### APIs provided by LetsGo

LetsGo boilerplate comes with the following APIs.

General APIs:

- `GET /v1/health` - a health endpoint used by AWS AppRunner to test the health of the deployed server.
- `POST /v1/contact` - post a new contact form fill from the _web_ component.

User management:

- `GET /v1/me` - returns information about the caller, including the list of tenants they have access to in the system.
- `PUT /v1/identity/:identityId` - update the user profile of a user with the specified identity.

Tenant management:

- `POST /v1/tenant` - creates a new tenant.
- `DELETE /v1/tenant/:tenantId` - soft-deletes a tenant.
- `GET /v1/tenant/:tenantId/user` - get all users authorized to manage the tenant.
- `DELETE /v1/tenant/:tenantId/user/:identityId` - remove a user from a tenant.
- `POST /v1/tenant/:tenantId/invitation` - create an invitation to join a tenant.
- `GET /v1/tenant/:tenantId/invitation` - get all active invitations to join a tenant.
- `DELETE /v1/tenant/:tenantId/invitation/:invitationId` - delete an active invitation to join a tenant.
- `POST /v1/tenant/:tenantId/invitation/:invitationId/accept` - add the caller to the tenant using the active invitation.

Subscription and payment management:

- `POST /v1/tenant/:tenantId/paymentmethod` - initiates a change of tenant's payment method in Stripe.
- `GET /v1/tenant/:tenantId/paymentmethod` - an endpoint Stripe redirects the browser to to complete the change of a tenant's payment method.
- `POST /v1/tenant/:tenantId/plan` - initiate a change of the subscription plan of a tenant.
- `POST /v1/stripe/webhook` - a webhook endpoint to receive Stripe events.

There isn't anything special about adding new APIs to the LetsGo server that is different from using regular [Express](https://expressjs.com/) features, but there are some middleware handlers included which you may find useful, described below.

### The `authenticate()` middleware

You can use the `authenticate()` middleware to ensure the request contains an `Authorization` header with a bearer access token which is a JWT token issued by one of the [trusted issuers](./manage-trust-and-authentication.md) configured in the system. You have indicated that Auth0 is one such trusted issuer during the [integration with Auth0](../tutorials/setting-up-authentication-with-auth0.md).

```ts
import { authenticate, AuthenticatedRequest } from "./middleware/authenticate";
import { Router } from "express";

const router = new Router();

route.get(`/v1/foo/bar`, authenticate(), async (req, res, next) => {
  const authenticatedRequest = req as AuthenticatedRequest;

  console.log("AUTHENTICATED CALLER", req.user);

  res.end();
});
```

The `authenticate()` middleware rejects the request with HTTP 401 if the access token is missing, not trusted, or otherwise invalid. Otherwise, it adds the `req.user` property to the request.

### The `authorizeTenant()` middleware

LetsGo does not prescribe any specific authorization model for your application. However, the `authorizeTenant()` middleware can be used to check if the caller has the permissions to manage a particular tenant. The middleware can only be used on routes that have `:tenantId` as one of the path segments, which means they represent an operation that is specific to a particular tenant. The `authorizeTenant()` middleware can only be used when preceeded by the `authenticate()` middleware:

```ts
import { authenticate, AuthenticatedRequest } from "./middleware/authenticate";
import { authorizeTenant } from "./middleware/authorizeTenant";
import { Router } from "express";

const router = new Router();

route.post(
  `/v1/tenant/:tenantId/order`,
  authenticate(),
  authorizeTenant(),
  async (req, res, next) => {
    // ...
  }
);
```

The `authorizeTenant()` middleware rejects the request with an HTTP 403 if the authenticated user making the call does not have permissions to manage the tenant identified by the `:tenantId` from the request path.

The tenant permission check can be optionally turned off if the caller presents a token issued by one of the [built-in issuers](./manage-trust-and-authentication.md) with:

```typescript
authorizeTenant({ allowBuiltInIssuer: true });
```

This is useful if you intend the API to be called from [within the _worker_ component](./develop-the-worker.md) or using ad-hoc access tokens created using `yarn ops jwt`. However, bear in mind that it also greatly expands the class of callers who are authorized to use this API.

### The `validateSchema()` middleware

LetsGo uses [Joi](https://joi.dev/) to validate the schema of the requests. The `validateSchema()` middleware is a wrapper around Joi that allows for validation of the request body, query parameters, and request headers.

```ts
import { authenticate, AuthenticatedRequest } from "./middleware/authenticate";
import { authorizeTenant } from "./middleware/authorizeTenant";
import { validateSchema } from "./middleware/validateSchema";
import Joi from "joi";
import { Router } from "express";

const router = new Router();

route.post(
  `/v1/tenant/:tenantId/taxRate`,
  authenticate(),
  authorizeTenant(),
  validateSchema({
    body: Joi.object().keys({
      newTaxRate: Joi.number().required(),
      reason: Joi.string();
    }),
    query: Joi.object().keys({
      responseType: Joi.string().valid("short", "full").required()
    }),
    headers: Joi.object().keys({
      ["transaction-id"]: Joi.string().regex(/^[a-z0-9]{64}$/).required()
    }).unknown(true);
  })
  async (req, res, next) => {
    // ...
  }
);
```

The way `validateSchema()` is configured in the example above, the request must have a `newTaxRate` property in the body, may have a string `reason` property, the query parameter `responseType` must be present and set to either `short` or `full`, and the `transaction-id` request header must be present with the value matching the provided regex. If any of these conditions are not met, the request is rejected with an HTTP 400 response.

### Related topics

[Enqueue asynchronous work](./enqueue-asynchronous-work.md)  
[Access data in the database from code](./access-data-in-the-database-from-code.md)  
[Develop the frontend](./develop-the-frontend.md)  
[Develop the worker](./develop-the-worker.md)
