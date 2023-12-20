## Develop the worker

The _worker_ component of the LetsGo boilerplate supports executing asynchronous work in the background, outside of the lifespan of an HTTP request. This work may include processing Stripe events delivered via a webhook, processing contact form submissions from the _web_ component, or work scheduled using a time-based scheduler.

<img width="836" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/835f7840-da4a-4c2e-bd1a-50864fb60c47">

This article assumes you have [integrated with Stripe to process payments](../tutorials/setting-up-payments-with-stripe.md).

### Technology

The _worker_ component is an [AWS Lambda handler](https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html) implemented in [TypeScript](https://www.typescriptlang.org/).

There are two use cases for executing asynchronous work in the worker:

1. Message-based execution that is triggered by messages received from a queue.
1. Time-based execution that is triggered by a scheduler.

### Message-based execution

The boilerplate LetsGo _worker_ implementation provides a simple message routing mechanism based on the `type` property of the received message. The scaffolding breaks down the routing logic all the way to the specific Stripe events generated in the lifecycle of a Stripe subscription but leaves the processing logic of those events unimplemented. You need to add custom processing logic to the Stripe events that are relevant to your application.

In the course of the development of your app, you may be adding support for custom message types to the worker.

When you [deploy your app to AWS](../tutorials/first-deployment-to-aws.md), the _worker_ component is packaged as a [Docker](https://www.docker.com/) image and deployed as an [AWS Lambda function](https://aws.amazon.com/pm/lambda). In addition, there is an [AWS SQS Standard Queue](https://aws.amazon.com/sqs/) in front of the Lambda function. New messages, regardless of their source, are first enqueued in SQS, and from there picked up for processing by a [Lambda Event Source Mapping](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html) which invokes the Lambda handler function. This mechanism supports throttling and error handling of message processing.

When [running locally](./run-locally.md), the _worker_ component is hosted as a plain [Node.js](https://nodejs.org/) HTTP server on `http://localhost:3002`. Unlike in the cloud, there is no queue in front of the _worker_ component when running locally. Any messages "enqueued" for the worker using the [@letsgo/queue](../reference/letsgo-queue/README.md) package will be immediately passed to the worker to process. This means there is no fidelity with any of the scalability/throttling/failure behaviors you would expect if the queue were present. In particular, messages that fail during processing are dumped as opposed to being re-tried or sent to a dead letter queue.

### Time-based execution

The boilerplate LetsGo _worker_ component is configured to execute scheduled work every hour. By default, the processing logic is a no-op but you can easily provide your implementation and adjust the schedule. You can read more about this process in [scheduling asynchronous work](./schedule-asynchronous-work.md).

When you [deploy your app to AWS](../tutorials/first-deployment-to-aws.md), the _worker_ component is packaged as a [Docker](https://www.docker.com/) image and deployed as an [AWS Lambda function](https://aws.amazon.com/pm/lambda). In addition, there is an [AWS EventBridge Scheduler](https://aws.amazon.com/blogs/compute/introducing-amazon-eventbridge-scheduler/) set up to invoke the Lambda handler function following a provided schedule.

When [running locally](./run-locally.md), the _worker_ component is hosted as a plain [Node.js](https://nodejs.org/) application, which uses the schedule configuration from the local `apps/worker/.env` file to execute the scheduled handler locally.

### Location

The _worker_ code is located in the `apps/worker` directory. Here are the key files you will be working with:

- `apps/worker/src/index.ts` - the AWS Lambda handler responsible for receiving messages and scheduled events, and routing them to handlers.
- `apps/worker/src/server.ts` - the lightweight HTTP server and scheduler used when running the worker locally.
- `apps/worker/src/api.ts` - helper functions used to call the _API_ endpoints from the worker code.
- `apps/worker/src/handlers` - handlers for individual message types.
- `apps/worker/src/handlers/stripe` - handlers for individual types of Stripe events.
- `apps/worker/src/handlers/scheduledEventHandler.ts` - handler of the scheduled events.

Message types are used across different components of the application, it is therefore convenient to define them in a shared location. The `@letsgo/types` package located in `packages/types` directory is used for this purpose. You will be adding new message types to that package.

### Messages and message handlers

When processing message-based events, messages delivered to the worker are in the JSON format and have the following structure:

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

Next, add a new `apps/worker/handlers/orderNewHandler.ts` file to the worker that implements the handler for the new message type, e.g.:

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

The simplest way for the worker to get hold of a suitable access token is to use one issued by the PKI-based trusted issuer registered in your LetsGo deployment. The worker boilerplate provides a `getAccessToken` facility function to create such an access token. You can then use it to make a call to the chosen endpoint on the _API_:

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

One challenge with asynchronous work is that it happens asynchronously, and the outcome of the processing is difficult to observe. LetsGo makes it easy to send notifications to Slack when important events happen. The _worker_ component is pre-wired to send Slack messages on important Stripe lifecycle events, you only need to enable it. Read the [send notifications to Slack](./send-notifications-to-slack.md) to set this up.

### Related topics

[Enqueue asynchronous work](./enqueue-asynchronous-work.md)  
[Schedule asynchronous work](./schedule-asynchronous-work.md)  
[Access data in the database from code](./access-data-in-the-database-from-code.md)  
[Send notifications to Slack](./send-notifications-to-slack.md)  
[Manage trust and authentication](./manage-trust-and-authentication.md)  
[Develop the frontend](./develop-the-frontend.md)  
[Develop the API](./develop-the-api.md)
