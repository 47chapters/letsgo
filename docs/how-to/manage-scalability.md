## Manage scalability

The choice of technologies in the LetsGo infrastructure allows you to control a variety of scalability settings to suit your workload needs. These settings are discussed separately for the _web_, _API_, _worker_, and _database_ components below.

<img width="837" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/af626761-0716-4119-84b2-33f1153d7033">

### How to set scalability settings

All of the settings described below have reasonable defaults chosen to support a development scenario. These defaults are defined as part of the [@letsgo/constants](../reference/letsgo-constants/README.md) package. You can override any of these defaults on a per-deployment basis using the [LetsGo CLI](../reference/letsgo-cli.md), specifically the `yarn ops config set` command. See [managing configuration](./manage-configuration.md) for details.

The scalability settings are only relevant in the AWS deployment. None of the scalability settings affect [running the stack locally](./run-locally.md) using `yarn dev`.

### Scaling the _web_ and _API_ components

Both the _web_ and _API_ components are deployed in [AWS AppRunner](https://aws.amazon.com/apprunner) and the types of controls you have over their scalability are the same.

These are the settings you can set using `yarn ops config set` that affect the _web_ scalability:

- `LETSGO_WEB_APPRUNNER_MIN_SIZE` is the minimum number of service instances to keep warm at any time. Default 1.
- `LETSGO_WEB_APPRUNNER_MAX_SIZE` is the maximum number of service instances to scale out to. Default 10.
- `LETSGO_WEB_APPRUNNER_MAX_CONCURRENCY` is the maximum number of concurrent requests handled by a single instance. Default 100.
- `LETSGO_WEB_APPRUNNER_CPU` is the virtual CPU power assigned to an instance. Default 1024.
- `LETSGO_WEB_APPRUNNER_MEMORY` is the memory size assigned to an instance. Default 2048.

Similar settings exist for the _API_ component: `LETSGO_API_APPRUNNER_MIN_SIZE`, `LETSGO_API_APPRUNNER_MAX_SIZE`, `LETSGO_API_APPRUNNER_MAX_CONCURRENCY`, `LETSGO_API_APPRUNNER_CPU`, `LETSGO_API_APPRUNNER_MEMORY`.

The default values for these settings are encoded in the `@letsgo/constants` package.

For details about how these settings affect scalability, read AWS documentation about [AppRunner automatic scaling](https://docs.aws.amazon.com/apprunner/latest/dg/manage-autoscaling.html).

### Scaling the _worker_ component

The _worker_ component consists of an [AWS Lambda function](https://aws.amazon.com/pm/lambda), an [AWS SQS Standard Queue](https://aws.amazon.com/sqs/), and an [AWS Event Source Mapping](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html) that connects the two. All have their own scalability behaviors and settings you can control.

For the _worker_'s Lambda function, you can set:

- `LETSGO_WORKER_EPHEMERAL_STORAGE` is the ephemeral disk storage available to an instance of the Lambda function in the `/tmp` location. Default 512.
- `LETSGO_WORKER_FUNCTION_TIMEOUT` is the maximum time the function is allowed to execute, in seconds. Default 60.
- `LETSGO_WORKER_MEMORY` is the memory size of the process running the Lambda function. Default 128.

For details about how these settings affect the scalability, read the AWS documentation on [configuring Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-function-common.html).

For the queue and event source mapping components that deliver messages to the worker Lambda function, you can control:

- `LETSGO_WORKER_BATCHING_WINDOW` is the time in seconds during which the event mapper waits for messages to accumulate in a batch before sending that batch to the worker. Default 2.
- `LETSGO_WORKER_BATCH_SIZE` is the maximum batch size of messages the worker will receive at a time. Default 10.
- `LETSGO_WORKER_CONCURRENCY` controls the maximum number of worker instances that can run concurrently. This multiplied by the maximum batch size gives you the upper bound on the concurrently processed messages. Default 5.
- `LETSGO_WORKER_MESSAGE_RETENTION_PERIOD` how long a message can stay in the queue without being successfully processed before it is discarded. Default 345600 (4 days).
- `LETSGO_WORKER_RECEIVE_MESSAGE_WAIT_TIME` is the maximum time in seconds SQS waits for messages to become available after getting a receive request. Default 2.
- `LETSGO_WORKER_VISIBILITY_TIMEOUT` how long a message stays hidden in the queue before it becomes eligible for re-delivery to the worker in case the worker does not confirm successful consumption. Default 360.

For details about how these settings affect the scalability, read AWS documentation on [configuring the queue as an event source](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-eventsource) and [configuring queue parameters](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-configure-queue-parameters.html).

### Scaling the database

The LetsGo database consists of a single [AWS DynamoDB](https://aws.amazon.com/dynamodb) table with auth-scaling enabled. No configuration settings are exposed to control the auto-scaling behavior. You can read the AWS documentation about [the default auto-scaling behavior](https://aws.amazon.com/blogs/database/amazon-dynamodb-auto-scaling-performance-and-cost-optimization-at-any-scale/) for more information.

### Related topics

[Managing configuration](./manage-configuration.md)  
[LetsGo CLI](../reference/letsgo-cli.md)  
[@letsgo/constants](../reference/letsgo-constants/README.md)  
[Developing the frontend](./develop-the-frontend.md)  
[Developing the API](./develop-the-api.md)  
[Developing the worker](./develop-the-worker.md)
