[@letsgo/constants](../README.md) / WorkerSettingsDefaultConfig

# Interface: WorkerSettingsDefaultConfig

The collection of default configuration settings of the _worker_ component.

## Hierarchy

- [`DefaultConfig`](DefaultConfig.md)

  ↳ **`WorkerSettingsDefaultConfig`**

## Table of contents

### Properties

- [batchSize](WorkerSettingsDefaultConfig.md#batchsize)
- [batchingWindow](WorkerSettingsDefaultConfig.md#batchingwindow)
- [concurrency](WorkerSettingsDefaultConfig.md#concurrency)
- [functionEphemeralStorage](WorkerSettingsDefaultConfig.md#functionephemeralstorage)
- [functionMemory](WorkerSettingsDefaultConfig.md#functionmemory)
- [functionTimeout](WorkerSettingsDefaultConfig.md#functiontimeout)
- [messageRetentionPeriod](WorkerSettingsDefaultConfig.md#messageretentionperiod)
- [receiveMessageWaitTime](WorkerSettingsDefaultConfig.md#receivemessagewaittime)
- [schedule](WorkerSettingsDefaultConfig.md#schedule)
- [scheduleTimezone](WorkerSettingsDefaultConfig.md#scheduletimezone)
- [visibilityTimeout](WorkerSettingsDefaultConfig.md#visibilitytimeout)

## Properties

### batchSize

• **batchSize**: `string`[]

The maximum number of messages the _worker_ component can process in a single invocation of the Lambda function.

#### Defined in

[index.ts:629](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L629)

___

### batchingWindow

• **batchingWindow**: `string`[]

The maximum time in seconds the _worker_ component waits for more messages to arrive before processing the batch.

#### Defined in

[index.ts:633](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L633)

___

### concurrency

• **concurrency**: `string`[]

The maximum number of concurrent instances of the _worker_ component.
This number multipled by the [batchSize](WorkerSettingsDefaultConfig.md#batchsize) is the upper bound on the number of concurrently processed messages.

#### Defined in

[index.ts:638](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L638)

___

### functionEphemeralStorage

• **functionEphemeralStorage**: `string`[]

The amount of ephemeral storage allocated to the Lambda function of the _worker_ component, available
in the `/tmp` directory.

#### Defined in

[index.ts:625](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L625)

___

### functionMemory

• **functionMemory**: `string`[]

The amount of memory allocated to the Lambda function of the _worker_ component.

#### Defined in

[index.ts:620](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L620)

___

### functionTimeout

• **functionTimeout**: `string`[]

The maximum time in seconds the Lambda function of the _worker_ component can run before it is terminated.

#### Defined in

[index.ts:616](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L616)

___

### messageRetentionPeriod

• **messageRetentionPeriod**: `string`[]

The maximum time in seconds an unconsumed message can stay in the SQS queue of the _worker_ component
before it is discarded.

#### Defined in

[index.ts:603](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L603)

___

### receiveMessageWaitTime

• **receiveMessageWaitTime**: `string`[]

The time in seconds a request for a message from the SQS queue remains pending if no message is available to read.

#### Defined in

[index.ts:612](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L612)

___

### schedule

• **schedule**: `string`[]

The EventBridge Schedule expression that controls the timing of the scheduled invocation of the
the Lambda function of the _worker_ component. Valid values are `cron({cron_expression})` and `rate({rate_expression})`,
as documented in [CreateScheduleCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-scheduler/Class/CreateScheduleCommand/).

#### Defined in

[index.ts:644](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L644)

___

### scheduleTimezone

• **scheduleTimezone**: `string`[]

The time zone used by the EventBridge Schedule expression that controls the timing of the scheduled invocation of the
the Lambda function of the _worker_ component. Valid values are [IANA time zone IDs](https://nodatime.org/TimeZones).

#### Defined in

[index.ts:649](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L649)

___

### visibilityTimeout

• **visibilityTimeout**: `string`[]

The time in seconds a message remains invisible in the SQS queue of the _worker_ component if it did not
confirm its processing.

#### Defined in

[index.ts:608](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L608)
