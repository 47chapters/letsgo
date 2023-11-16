@letsgo/queue

# @letsgo/queue

The package provides a way to enqueue messages to be processed by the LetsGo _worker_.

## Table of contents

### Interfaces

- [EnqueueOptions](interfaces/EnqueueOptions.md)
- [EnqueueResult](interfaces/EnqueueResult.md)

### Functions

- [enqueue](README.md#enqueue)
- [listLetsGoQueues](README.md#listletsgoqueues)

## Functions

### enqueue

▸ **enqueue**(`message`, `options?`): `Promise`\<[`EnqueueResult`](interfaces/EnqueueResult.md)\>

Enqueues a message to be processed by the LetsGo _worker_. If the `LETSGO_LOCAL_QUEUE_URL` environment variable is set,
the message is sent to the specified URL with an HTTP POST instead of being enqueued to AWS SQS. This environment variable
is used in the local development scenario to allow the _worker_ component to run behind a lightweight HTTP server
on the developer's machine.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `Message` | The message to enqueue |
| `options?` | [`EnqueueOptions`](interfaces/EnqueueOptions.md) | Options for enqueueing the message |

#### Returns

`Promise`\<[`EnqueueResult`](interfaces/EnqueueResult.md)\>

Enqeue result, including SQS message Id.

#### Defined in

[index.ts:200](https://github.com/tjanczuk/letsgo/blob/8eacb6a/packages/queue/src/index.ts#L200)

___

### listLetsGoQueues

▸ **listLetsGoQueues**(`region`, `deployment?`): `Promise`\<`string`[]\>

Lists all SQS queue URLs created by LetsGo in a given region and optionally to support a given deployment.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region |
| `deployment?` | `string` | LetsGo deployment name |

#### Returns

`Promise`\<`string`[]\>

Array of matching SQS queue URLs

#### Defined in

[index.ts:40](https://github.com/tjanczuk/letsgo/blob/8eacb6a/packages/queue/src/index.ts#L40)
