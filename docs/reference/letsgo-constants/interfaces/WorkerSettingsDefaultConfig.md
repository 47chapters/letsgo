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
- [visibilityTimeout](WorkerSettingsDefaultConfig.md#visibilitytimeout)

## Properties

### batchSize

• **batchSize**: `string`[]

The maximum number of messages the _worker_ component can process in a single invocation of the Lambda function.

#### Defined in

[index.ts:619](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L619)

___

### batchingWindow

• **batchingWindow**: `string`[]

The maximum time in seconds the _worker_ component waits for more messages to arrive before processing the batch.

#### Defined in

[index.ts:623](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L623)

___

### concurrency

• **concurrency**: `string`[]

The maximum number of concurrent instances of the _worker_ component.
This number multipled by the [batchSize](WorkerSettingsDefaultConfig.md#batchsize) is the upper bound on the number of concurrently processed messages.

#### Defined in

[index.ts:628](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L628)

___

### functionEphemeralStorage

• **functionEphemeralStorage**: `string`[]

The amount of ephemeral storage allocated to the Lambda function of the _worker_ component, available
in the `/tmp` directory.

#### Defined in

[index.ts:615](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L615)

___

### functionMemory

• **functionMemory**: `string`[]

The amount of memory allocated to the Lambda function of the _worker_ component.

#### Defined in

[index.ts:610](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L610)

___

### functionTimeout

• **functionTimeout**: `string`[]

The maximum time in seconds the Lambda function of the _worker_ component can run before it is terminated.

#### Defined in

[index.ts:606](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L606)

___

### messageRetentionPeriod

• **messageRetentionPeriod**: `string`[]

The maximum time in seconds an unconsumed message can stay in the SQS queue of the _worker_ component
before it is discarded.

#### Defined in

[index.ts:593](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L593)

___

### receiveMessageWaitTime

• **receiveMessageWaitTime**: `string`[]

The time in seconds a request for a message from the SQS queue remains pending if no message is available to read.

#### Defined in

[index.ts:602](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L602)

___

### visibilityTimeout

• **visibilityTimeout**: `string`[]

The time in seconds a message remains invisible in the SQS queue of the _worker_ component if it did not
confirm its processing.

#### Defined in

[index.ts:598](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L598)
