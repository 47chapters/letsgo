## Enqueue asynchronous work

The _worker_ component of the LetsGo boilerplate supports executing asynchronous work in the background, outside of the lifespan of an HTTP request. Aside from processing Stripe events delivered via a webhook, your application may define and schedule its own types of asynchronous work.

<img width="836" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/835f7840-da4a-4c2e-bd1a-50864fb60c47">

This article assumes you already know how to [develop the worker](./develop-the-worker.md) to define the processing logic for asynchronous work and will talk about ways to schedule it.

### Common use cases

There are two common contexts in which you may want to schedule asynchronous work: from within the _API_ component, and from within the _worker_.

When your application receives an HTTP request that requires work that cannot, should not, or needs not be completed during the lifetime of the HTTP request, you can schedule its asynchronous execution by the worker for later, and immediately respond to the HTTP request. One such case, which is already implemented in the LetsGo boilerplate, is the `POST /v1/contact` endpoint. It accepts a contact form submission from the _web_ component and schedules its processing for the _worker_ by enqueuing a message with the type `letsgo:contact`.

In another case, processing one chunk of asynchronous work in the _worker_ itself may require scheduling subsequent asynchronous jobs for later. For example, when you encounter errors or throttling limits when connecting to downstream services to complete an asynchronous job, you may want to re-schedule that job for later.

### How to enqueue asynchronous work

LetsGo provides the `@letsgo/queue` package in the `packages/queue` directory which should be used to enqueue work for the _worker_. The package is already wired up and ready for use from within the _API_ and _worker_ components, both when running locally or in the cloud.

In the simplest case, this is how you enqueue a hypothetical "new order" message for processing by the worker:

```typescript
import { enqueue } from "@letsgo/queue";

async function scheduleNewOrder() {
  await enqueue({
    type: "order:new",
    payload: {
      orderId: "123",
      customerId: "456",
    },
  });
}
```

It is a good practice to strongly type your messages for consistency between the _worker_ code and the client code. Continuing from the example introduced in [developing the worker](./develop-the-worker.md), a convenient place to share your message types across components is the `@letsgo/types` package in the `packages/types` directory. Using the `OrderNewMessage` type introduced in [developing the worker](./develop-the-worker.md), the code above can be better implemented as:

```typescript
import { enqueue } from "@letsgo/queue";
import { OrderNewMessage } from "@letsgo/types";

async function scheduleNewOrder() {
  const message: OrderNewMessage = {
    type: "order:new",
    payload: {
      orderId: "123",
      customerId: "456",
    },
  };
  await enqueue(message);
}
```

Due to AWS SQS limitations, the overall size of a message cannot exceed around 250KB. If your messages are larger, you need to [store them in the database](./access-data-in-the-database-from-code.md) and only send a key of the database entry as part of your message. The _worker_ logic can then retrieve and delete the item from the database when it receives the message for processing.

### Delayed messages

Sometimes it is useful to delay the processing of enqueued messages by the _worker_. For example, when a downstream service required to process the work is down or has reached a throttling limit, you may want to implement a retry with an exponential back-off.

In those cases, you can pass an option to `enqueue` telling it to delay the delivery of the message to the _worker_ by a specific number of seconds, up to 900 (i.e. 15 minutes). If you need longer delays, you need to implement that logic yourself by re-enqueuing messages received by the worker with an ever-decreasing delay:

```typescript
import { enqueue } from "@letsgo/queue";
import { OrderNewMessage } from "@letsgo/types";

async function scheduleNewOrder() {
  const message: OrderNewMessage = {
    type: "order:new",
    payload: {
      orderId: "123",
      customerId: "456",
    },
  };
  await enqueue(message, { delaySeconds: 120 });
}
```

### Local vs cloud behavior

<!-- markdown-link-check-disable -->

When [running locally](../tutorials/building-and-running-locally.md), there is no queue between your client and the _worker_, and the _worker_ is hosted as a plain Node.js process in a lightweight HTTP server on http://localhost:3002. This means there are some differences in the behavior of `enqeue`` between local and cloud environments:

<!-- markdown-link-check-enable -->

1. Messages enqueued using `enqueue` are immediately delivered to the _worker_ for execution with an HTTP call.
1. The `delaySeconds` is not observed.
1. Any throttling/retry/error handling behaviors of the AWS SQS queue do not exist. Messages that the _worker_ fails to process are simply ignored.

## Related topics

[Access data in the database from code](./access-data-in-the-database-from-code.md)  
[Develop the API](./develop-the-api.md)  
[Develop the worker](./develop-the-worker.md)  
[Schedule asynchronous work](./schedule-asynchronous-work.md)
