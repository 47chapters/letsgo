## Schedule asynchronous work

The _worker_ component of the LetsGo boilerplate supports executing asynchronous work in the background triggered by a schedule. This capability enables you to perform periodic background tasks in your application.

<img width="924" alt="LetsGo Worker Scheduler" src="https://github.com/47chapters/letsgo/assets/822369/1ea8e2a3-6864-488d-a71a-4b3f0fdfdd05">

This article assumes you already know how to [develop the worker](./develop-the-worker.md) to define the processing logic for asynchronous work and will talk about ways to schedule it.

### Common use cases

There are many use cases for performing scheduled, asynchronous work in your application. Two common ones are:

1. Integration with external systems to synchronize data.
1. Cleanup of your application's internal state.

### How to schedule asynchronous work

By default, the _worker_ component triggers scheduled work every hour. You can adjust the work schedule through the _worker_'s configuration, and implement your processing logic in an event handler. You can also turn off the scheduled execution of the worker entirely if you don't need such logic in your application.

To modify the execution schedule, you need to set the `LETSGO_WORKER_SCHEDULE` configuration setting and redeploy the worker:

```bash
yarn ops config set LETSGO_WORKER_SCHEDULE='rate(1 minute)'
yarn ops deploy -a worker
```

The value of the `LETSGO_WORKER_SCHEDULE` setting can have one of two forms:

- `rate({number} {unit})` to run scheduled work periodically with a specified frequency, for example, `rate(5 minutes)`. For the `{unit}`, you can specify `minute`, `minutes`, `hour`, `hours`, `day`, or `days`.
- `cron({cron_expression})` to run scheduled work following a CRON expression. For example, `cron(0 0 * * 1)` will run every Monday at midnight. To construct and test a `{cron_expression}`, you can use [crontab.guru](https://crontab.guru).

By default, `cron(...)` expressions use the UTC time zone. You can specify a different time zone to use with the `LETSGO_WORKER_SCHEDULE_TIMEZONE` configuration setting:

```bash
yarn ops config set LETSGO_WORKER_SCHEDULE='cron(0 0 * * 1)'
yarn ops config set LETSGO_WORKER_SCHEDULE_TIMEZONE=America/Los_Angeles
yarn ops deploy -a worker
```

**NOTE** You must enclose the `cron(...)` value in single quotes to prevent undesired expansion of `*` characters.

Valid time zone values are defined by [IANA](https://nodatime.org/TimeZones).

### How to implement asynchronous work

The _worker_ includes a single handler function to implement your processing logic for scheduled events in `apps/worker/src/handlers/scheduledEventHandler.ts`. The default implementation does nothing useful except logging an entry:

```typescript
import { Context, EventBridgeEvent } from "aws-lambda";

export const scheduledHandler = async (
  event: EventBridgeEvent<"Scheduled Event", any>,
  context: Context
): Promise<void> => {
  console.log(
    `WORKER RECEIVED SCHEDULED EVENT ID ${event.id} WITH TIMESTAMP ${event.time}`
  );
};
```

After you modify the handler with your code, you need to build a new _worker_ image and redeploy:

```bash
yarn ops buildx --filter worker
yarn ops deploy -a worker
```

### How to turn the scheduled execution on and off

You can turn scheduled execution off entirely if your application does not need it, or if you need to temporarily pause the execution of the scheduled events with:

```bash
yarn ops stop -a worker-scheduler
```

You can later turn the execution back on with:

```bash
yarn ops start -a worker-scheduler
```

### How to check the status of the scheduler

You can check the current status of the scheduler with:

```bash
$ yarn ops status -a worker
...
Worker
  ...
  Schedule
    State          DISABLED
    Expression     rate(1 minute)
    Timezone       UTC
    Arn            arn:aws:scheduler:us-west-2:182606571448:schedule/letsgo-main-worker/letsgo-main-worker
    Updated        Tue Dec 19 2023 15:50:13 GMT+0100 (Central European Standard Time)
```

## Related topics

[Develop the worker](./develop-the-worker.md)  
[Enqueue asynchronous work](./enqueue-asynchronous-work.md)
