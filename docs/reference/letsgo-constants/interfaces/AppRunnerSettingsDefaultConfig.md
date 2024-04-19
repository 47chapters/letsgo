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

[index.ts:316](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L316)

___

### healthHealthyThreshold

• **healthHealthyThreshold**: `string`[]

The number of consecutive successful health checks before the instance of the component is considered healthy.

#### Defined in

[index.ts:338](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L338)

___

### healthInterval

• **healthInterval**: `string`[]

Frequency in seconds of the App Runner health check for the component.

#### Defined in

[index.ts:329](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L329)

___

### healthPath

• **healthPath**: `string`[]

The path of the HTTP endpoint used by the App Runner health check to determine
if the instance of the component is healthy.

#### Defined in

[index.ts:325](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L325)

___

### healthTimeout

• **healthTimeout**: `string`[]

The maximum time in seconds the App Runner healh check for the component can take before
it is considered failed.

#### Defined in

[index.ts:334](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L334)

___

### healthUnhealthyThreshold

• **healthUnhealthyThreshold**: `string`[]

The number of consecutive failed health checks before the instance of the component is considered unhealthy.

#### Defined in

[index.ts:342](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L342)

___

### maxConcurrency

• **maxConcurrency**: `string`[]

The maximum number of concurrent HTTP requests processed by a single instance of the component.

#### Defined in

[index.ts:312](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L312)

___

### maxSize

• **maxSize**: `string`[]

The maxium number of instances of the component.

#### Defined in

[index.ts:308](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L308)

___

### memory

• **memory**: `string`[]

The amount of memory allocated to a single instance of the component.

#### Defined in

[index.ts:320](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L320)

___

### minSize

• **minSize**: `string`[]

The minimum number of instances of the component to keep running at all times.

#### Defined in

[index.ts:304](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L304)
