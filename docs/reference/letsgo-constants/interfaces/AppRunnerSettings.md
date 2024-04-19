[@letsgo/constants](../README.md) / AppRunnerSettings

# Interface: AppRunnerSettings

Parameters that control the creation of an App Runner service and related AWS resources.

## Table of contents

### Properties

- [Name](AppRunnerSettings.md#name)
- [defaultConfig](AppRunnerSettings.md#defaultconfig)
- [getAppRunnerAutoScalingConfigurationName](AppRunnerSettings.md#getapprunnerautoscalingconfigurationname)
- [getAppRunnerServiceName](AppRunnerSettings.md#getapprunnerservicename)
- [getEcrRepositoryName](AppRunnerSettings.md#getecrrepositoryname)
- [getInlineRolePolicy](AppRunnerSettings.md#getinlinerolepolicy)
- [getLocalRepositoryName](AppRunnerSettings.md#getlocalrepositoryname)
- [getLogRetentionInDays](AppRunnerSettings.md#getlogretentionindays)
- [getManagedPolicyArns](AppRunnerSettings.md#getmanagedpolicyarns)
- [getPolicyName](AppRunnerSettings.md#getpolicyname)
- [getRoleName](AppRunnerSettings.md#getrolename)
- [serviceUrlConfigKey](AppRunnerSettings.md#serviceurlconfigkey)

## Properties

### Name

• **Name**: `string`

The name of the component for which an AppRunner service is created (`web` or `api`).

#### Defined in

[index.ts:352](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L352)

___

### defaultConfig

• **defaultConfig**: [`AppRunnerSettingsDefaultConfig`](AppRunnerSettingsDefaultConfig.md)

Returns the default configuration settings for the component.

#### Defined in

[index.ts:425](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L425)

___

### getAppRunnerAutoScalingConfigurationName

• **getAppRunnerAutoScalingConfigurationName**: (`deployment`: `string`) => `string`

#### Type declaration

▸ (`deployment`): `string`

Returns the name of the AppRunner auto scaling configuration to create.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

AppRunner Auto Scaling Configuration name

#### Defined in

[index.ts:410](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L410)

___

### getAppRunnerServiceName

• **getAppRunnerServiceName**: (`deployment`: `string`) => `string`

#### Type declaration

▸ (`deployment`): `string`

Returns the name of the AppRunner service to create.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

AppRunner service name

#### Defined in

[index.ts:404](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L404)

___

### getEcrRepositoryName

• **getEcrRepositoryName**: (`deployment`: `string`) => `string`

#### Type declaration

▸ (`deployment`): `string`

Returns the name of the ECR repository to create to store the Docker images for the AppRunner service.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

ECR repository name

#### Defined in

[index.ts:392](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L392)

___

### getInlineRolePolicy

• **getInlineRolePolicy**: (`accountId`: `string`, `region`: `string`, `deployment`: `string`) => `object`

#### Type declaration

▸ (`accountId`, `region`, `deployment`): `object`

Returns a JavaScript object describing the inline IAM policy that will be included in the IAM role
created for the AppRunner service.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountId` | `string` | AWS account ID |
| `region` | `string` | AWS region |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`object`

IAM inline policy document

#### Defined in

[index.ts:375](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L375)

___

### getLocalRepositoryName

• **getLocalRepositoryName**: (`deployment`: `string`) => `string`

#### Type declaration

▸ (`deployment`): `string`

Returns the name of the locally built Docker image containing code for the component to be deployed.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

Local Docker image name (without the tag)

#### Defined in

[index.ts:398](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L398)

___

### getLogRetentionInDays

• **getLogRetentionInDays**: (`region`: `string`, `deployment`: `string`) => `number`

#### Type declaration

▸ (`region`, `deployment`): `number`

Returns the number of days to retain the CloudWatch logs for the AppRunner service.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`number`

Number of days to retain CloudWatch logs.

#### Defined in

[index.ts:417](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L417)

___

### getManagedPolicyArns

• **getManagedPolicyArns**: (`region`: `string`, `deployment`: `string`) => `string`[]

#### Type declaration

▸ (`region`, `deployment`): `string`[]

Returns an array of ARNs of managed IAM policies to attach to the IAM role created for the AppRunner service.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`[]

Array of managed IAM policy ARNs

#### Defined in

[index.ts:386](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L386)

___

### getPolicyName

• **getPolicyName**: (`region`: `string`, `deployment`: `string`) => `string`

#### Type declaration

▸ (`region`, `deployment`): `string`

Returns the name of the IAM policy to create for the the App Runner service.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

IAM policy name

#### Defined in

[index.ts:366](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L366)

___

### getRoleName

• **getRoleName**: (`region`: `string`, `deployment`: `string`) => `string`

#### Type declaration

▸ (`region`, `deployment`): `string`

Returns the name of the IAM role to create for the the App Runner service.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

IAM role name

#### Defined in

[index.ts:359](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L359)

___

### serviceUrlConfigKey

• **serviceUrlConfigKey**: `string`

Returns the name of the environment variable containing the public URL of the AppRunner service.

#### Defined in

[index.ts:421](https://github.com/47chapters/letsgo/blob/06da252/packages/constants/src/index.ts#L421)
