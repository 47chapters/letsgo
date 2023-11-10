## Develop the worker

The _worker_ component of the LetsGo boilerplate supports executing asynchronous work in the background, outside of the lifespan of an HTTP request. This work may include processing Stripe events delivered via a webhook, processing contact form submissions on the _web_, or other work that is specific to your application.

<img width="836" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/835f7840-da4a-4c2e-bd1a-50864fb60c47">

This article assumes you have [integrated with Stripe to process payments](../tutorials/setting-up-payments-with-stripe.md).

### Technology

The _worker_ component is an [AWS Lambda handler](https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html) implemented in [TypeScript](https://www.typescriptlang.org/).

The boilerplate LetsGo _worker_ implementation provides a a simple message routing mechanism based on the `type` property of the message the handler receives to process. The scaffolding breaks down the routing logic all the way to the specific Stripe events generated in the lifecycle of a Stripe subscription, but leaves the processing of those events unimplemented. You need to add custom processing logic to the Stripe events that are relevant to your application.

In the course of development of your app, you may be adding support for custom message types to the worker.

When you [deploy your app to AWS](../tutorials/first-deployment-to-aws.md), the _worker_ component is packaged as a [Docker](https://www.docker.com/) image and deployed as an [AWS Lambda function](https://aws.amazon.com/pm/lambda). In addition, there is an [AWS SQS Simple Queue](https://aws.amazon.com/sqs/) in front of the Lambda function. New messages, regardless of their source, are first enqeued in SQS, and from there picked up for processing by a [Lambda Event Source Mapping](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html). This mechanism supports throttling and error handling of message processing.

When [running locally](./run-locally.md), the _worker_ component is hosted as a plain [Node.js](https://nodejs.org/) HTTP server on `http://localhost:3002`. Unlike in the cloud, there is no queue in front of the _worker_ component when running locally. Any messages "enqueued" for the worker using the [@letsgo/queue](../reference/letsgo-queue.md) package will be immediately passed to the worker to process. This means there is no fidelity with any of the scalability/throttling/failure behaviors you would expect if the queue were present. In particular, messages that fail during processing are dumped as opposed to being re-tried or sent to a dead letter queue.

### Location

The _worker_ code is located in the `apps/worker` directory. Here are key files you will be working with:

- `apps/worker/index.ts` - the AWS Lambda handler responsible for receiving messages, routing them to handlers, and reporting back failures to SQS.
- `apps/worker/server.ts` - the lightweight HTTP server used when running the worker locally.
- `apps/worker/api.ts` - helper functions used to call the _API_ endpoints from the worker code.
- `apps/worker/handlers` - handlers for individual message types.
- `apps/worker/handlers/stripe` - handlers for individual types of Stripe events

Message types are used across different components of the application, it is therefore conveninent to define them in a shared location. The `@letsgo/types` package located in `packages/types` directory is used for this purpose. You will be adding new message types to that package.

### Messages and message handlers

Messages delivered to the worker are in the JSON format and have the following structure:

```typescript
interface Message {
  type: string;
  payload: any;
}
```

The `type` property is the key used when dispatching messages to handlers. You can define your own message types, but do not use values that start with `letsgo:` - these are reserved for current and future use of the boilerplate.

The payload of messages with the type of `letsgo:stripe` represents Stripe webhook events. All those events have their own `type` field defined in the Stripe schema. LetsGo boilerplate performs a second level of dispatch using the Stripe event type in `apps/worker/handlers/stripeHandler.ts`, with the actual processing logic you can implement in the handlers in the `app/worker/handlers/stripe` directory.

### Add a new message type

To add support for a new message type to the worker, you need to define its type, schema of the payload, and register a handler for it in the worker's dispatch system.

Let's say you want to add a message representing a new order. First, locate the `MessageType` enum in the `packages/types/index.ts` file and add your new message type there, e.g. :

```typescript
export enum MessageType {
  // ...
  OrderNew = "OrderNew", // New order created
}
```

In the same file, define and export a new message type that describes the schema of your message, e.g.:

```typescript
export interface OrderNewMessage extends Message {
  type: MessageType.OrderNew;
  payload: {
    orderId: string;
    customerId: string;
  };
}
```

Next, add a new `apps/worker/handlers/newOrderHandler.ts` file to the worker that implements the handler for the new message type, e.g.:

```typescript
import { OrderNewMessage, Message } from "@letsgo/types";
import { MessageHandler } from "./index";

export const orderNewHandler: MessageHandler<Message> = async (
  message,
  event,
  context
) => {
  const newOrder = (message as OrderNewMessage).payload;

  // do something useful with newOrder
};
```

Lastly, register your new message type in the worker's dispatch system in `apps/worker/handlers/index.ts`:

```typescript
import { orderNewHandler } from "./orderNewHandler";

//...

export const handlers: { [type: string]: MessageHandler<Message> } = {
  //...
  [MessageType.OrderNew]: orderNewHandler,
};
```

That's it, the worker will now recognize and process a new message type. Read how to [enqueue asynchronous work](./enqueue-asynchronous-work.md) to learn how to schedule the new message type for processing.

### Calling APIs from the worker

Implementing message processing logic in the worker often requires calling the HTTP APIs exposed by the _API_ component. The boilerplate LetsGo worker code is pre-configured to make it easy, both when running locally and in AWS.

If the API you are calling performs any sensitive work, you have likely secured it to require authentication and authorization. The worker must therefore obtain an access token it can present when calling the API. You can read more about different ways of obtaining that access token in [Manage trust and authentication](./manage-trust-and-authentication.md).

The simplest way for the worker to get hold of a suitable access token is to use one issued by the PKI-based trusted issuer registered in your LetsGo deployment. The worker boilerplate provides a `getAccessToken` facility function to create such access token. You can then use it to make a call to the chosen endpoint on the _API_:

```typescript
import { Message } from "@letsgo/types";
import { MessageHandler } from "./index";
import { getAccessToken } from "../api";

export const myMessageHandler: MessageHandler<Message> = async (
  message,
  event,
  context
) => {
  const accessToken = await getAccessToken();
  const url = `${process.env.LETSGO_API_URL}/v1/my/endpoint`;
  const authorization = `Bearer ${accessToken}`;
  const apiResult = await fetch(url, { headers: { authorization } });
  if (!apiResult.ok) {
    throw new Error(
      `API call failed: HTTP ${apiResult.status} ${apiResult.statusText}`
    );
  }
  const response = await apiResult.json();
  console.log("API call succeeded:", response);
};
```

**NOTE** The access token created by the `getAccessToken` facility function has the `sub` claim of `letsgo:worker`, which you need to account for in the authorization logic of the HTTP API you are calling.

### Increasing visibility with Slack notifications

One challenge with asynchronous work is that it happens asynchronously, and the outcome of the processig is difficult to observe. Logs are collected in CloudWatch, but these are usually used for post-mortem analysis.

In the early stages of product development, and in the early stages of a startup life, it is often useful and exciting to be notified in real time about interesting events happening in the system. A customer just paid you a monthly subscription fee. A new customer signed up. A customer upgraded their plan from freemium to paid. A customer churned. One useful way of staying on top of such events is to send an automated notification to Slack.

LetsGo worker boilerplate makes sending notifications to Slack easy.

First, create a [Slack incoming webhook](https://api.slack.com/messaging/webhooks) that allows sending notifications to a specific channel in your Slack workspace. You will end up with an URL that looks similar to `https://hooks.slack.com/services/T05U3L3AHGV/B0....QNB/U0F....RrQ`.

Add a new environent variable to `apps/worker/.env` file to enable slack notifications when [running locally](../tutorials/building-and-running-locally.md):

```bash
cat >> apps/worker/.env <<EOF
LETSGO_SLACK_URL={your-slack-incoming-webhook-url}
EOF
```

Set the same environment variable in your cloud deployment and re-deploy the worker:

```bash
yarn ops config set LETSGO_SLACK_URL={your-slack-incoming-webhook-url}
yarn ops deploy -a worker
```

And you are done! Out of the gate, LetsGo will now be sending notifications to Slack when new tenants are created, existing tenants are deleted, and on all Stripe events received via Stripe webhooks, including the most precious one:

<img width="388" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/73166dd0-bee4-4cbf-9cad-f279eaef6211">

If you want to add Slack notifications for the new message handlers you are adding to the worker, you can use the `sendSlackMessage` facility function provided by LetsGo in the `@letsgo/slack` package:

```typescript
import { Message } from "@letsgo/types";
import { MessageHandler } from "./index";
import { sendSlackMessage } from "@letsgo/slack";

export const myMessageHandler: MessageHandler<Message> = async (
  message,
  event,
  context
) => {
  // ...
  await sendSlackMessage(":boom::moneybag: New mega deal closed!");
};
```

You can leave the calls to `sendSlackMessage` in code - they become a no-op if the `LETSGO_SLACK_URL` variable is not defined in the environemnt.

### Related topics

[Enqueue asynchronous work](./enqueue-asynchronous-work.md)  
[Access data in the database from code](./access-data-in-the-database-from-code.md)  
[Manage trust and authentication](./manage-trust-and-authentication.md)  
[Develop the frontend](./develop-the-frontend.md)  
[Develop the API](./develop-the-api.md)
