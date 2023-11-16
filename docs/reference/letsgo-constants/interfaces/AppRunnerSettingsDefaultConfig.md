[@letsgo/constants](../README.md) / AppRunnerSettingsDefaultConfig

# Interface: AppRunnerSettingsDefaultConfig

The collection of default configuration settings common to the _web_ and _API_ components.

## Hierarchy

- [`DefaultConfig`](DefaultConfig.md)

  ↳ **`AppRunnerSettingsDefaultConfig`**

## Table of contents

### Properties

- [cpu](AppRunnerSettingsDefaultConfig.md#cpu)
- [healthHealthyThreshold](AppRunnerSettingsDefaultConfig.md#healthhealthythreshold)
- [healthInterval](AppRunnerSettingsDefaultConfig.md#healthinterval)
- [healthPath](AppRunnerSettingsDefaultConfig.md#healthpath)
- [healthTimeout](AppRunnerSettingsDefaultConfig.md#healthtimeout)
- [healthUnhealthyThreshold](AppRunnerSettingsDefaultConfig.md#healthunhealthythreshold)
- [maxConcurrency](AppRunnerSettingsDefaultConfig.md#maxconcurrency)
- [maxSize](AppRunnerSettingsDefaultConfig.md#maxsize)
- [memory](AppRunnerSettingsDefaultConfig.md#memory)
- [minSize](AppRunnerSettingsDefaultConfig.md#minsize)

## Properties

### cpu

• **cpu**: `string`[]

The amount of CPU allocated to a single instance of the component.

#### Defined in

[index.ts:306](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L306)

___

### healthHealthyThreshold

• **healthHealthyThreshold**: `string`[]

The number of consecutive successful health checks before the instance of the component is considered healthy.

#### Defined in

[index.ts:328](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L328)

___

### healthInterval

• **healthInterval**: `string`[]

Frequency in seconds of the App Runner health check for the component.

#### Defined in

[index.ts:319](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L319)

___

### healthPath

• **healthPath**: `string`[]

The path of the HTTP endpoint used by the App Runner health check to determine
if the instance of the component is healthy.

#### Defined in

[index.ts:315](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L315)

___

### healthTimeout

• **healthTimeout**: `string`[]

The maximum time in seconds the App Runner healh check for the component can take before
it is considered failed.

#### Defined in

[index.ts:324](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L324)

___

### healthUnhealthyThreshold

• **healthUnhealthyThreshold**: `string`[]

The number of consecutive failed health checks before the instance of the component is considered unhealthy.

#### Defined in

[index.ts:332](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L332)

___

### maxConcurrency

• **maxConcurrency**: `string`[]

The maximum number of concurrent HTTP requests processed by a single instance of the component.

#### Defined in

[index.ts:302](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L302)

___

### maxSize

• **maxSize**: `string`[]

The maxium number of instances of the component.

#### Defined in

[index.ts:298](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L298)

___

### memory

• **memory**: `string`[]

The amount of memory allocated to a single instance of the component.

#### Defined in

[index.ts:310](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L310)

___

### minSize

• **minSize**: `string`[]

The minimum number of instances of the component to keep running at all times.

#### Defined in

[index.ts:294](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L294)
