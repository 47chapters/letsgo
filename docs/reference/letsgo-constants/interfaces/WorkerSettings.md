[@letsgo/constants](../README.md) / WorkerSettings

# Interface: WorkerSettings

Parameters that control the creation of AWS resources related to the _worker_ component.

## Table of contents

### Properties

- [defaultConfig](WorkerSettings.md#defaultconfig)
- [getEcrRepositoryName](WorkerSettings.md#getecrrepositoryname)
- [getInlineRolePolicy](WorkerSettings.md#getinlinerolepolicy)
- [getLambdaFunctionName](WorkerSettings.md#getlambdafunctionname)
- [getLocalRepositoryName](WorkerSettings.md#getlocalrepositoryname)
- [getLogRetentionInDays](WorkerSettings.md#getlogretentionindays)
- [getManagedPolicyArns](WorkerSettings.md#getmanagedpolicyarns)
- [getPolicyName](WorkerSettings.md#getpolicyname)
- [getQueueNamePrefix](WorkerSettings.md#getqueuenameprefix)
- [getRoleName](WorkerSettings.md#getrolename)

## Properties

### defaultConfig

• **defaultConfig**: [`WorkerSettingsDefaultConfig`](WorkerSettingsDefaultConfig.md)

Returns the default configuration settings for the component.

#### Defined in

[index.ts:703](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L703)

___

### getEcrRepositoryName

• **getEcrRepositoryName**: (`deployment`: `string`) => `string`

#### Type declaration

▸ (`deployment`): `string`

Returns the name of the ECR repository to create to store the Docker images for the _worker_ component.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

ECR repository name

#### Defined in

[index.ts:680](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L680)

___

### getInlineRolePolicy

• **getInlineRolePolicy**: (`accountId`: `string`, `region`: `string`, `deployment`: `string`) => `object`

#### Type declaration

▸ (`accountId`, `region`, `deployment`): `object`

Returns a JavaScript object describing the inline IAM policy that will be included in the IAM role
created for the _worker_ component.

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

[index.ts:663](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L663)

___

### getLambdaFunctionName

• **getLambdaFunctionName**: (`deployment`: `string`) => `string`

#### Type declaration

▸ (`deployment`): `string`

Returns the name of the Lambda function to create for the _worker_ component.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

Lambda function name

#### Defined in

[index.ts:692](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L692)

___

### getLocalRepositoryName

• **getLocalRepositoryName**: (`deployment`: `string`) => `string`

#### Type declaration

▸ (`deployment`): `string`

Returns the name of the locally built Docker image containing code for the _worker_ component to be deployed.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

Local Docker image name (without the tag)

#### Defined in

[index.ts:686](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L686)

___

### getLogRetentionInDays

• **getLogRetentionInDays**: (`region`: `string`, `deployment`: `string`) => `number`

#### Type declaration

▸ (`region`, `deployment`): `number`

Returns the number of days to retain the CloudWatch logs for the Lambda function of the _worker_ component.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`number`

Number of days to retain CloudWatch logs.

#### Defined in

[index.ts:699](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L699)

___

### getManagedPolicyArns

• **getManagedPolicyArns**: (`region`: `string`, `deployment`: `string`) => `string`[]

#### Type declaration

▸ (`region`, `deployment`): `string`[]

Returns an array of ARNs of managed IAM policies to attach to the IAM role created for the _worker_ component.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`[]

Array of managed IAM policy ARNs

#### Defined in

[index.ts:674](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L674)

___

### getPolicyName

• **getPolicyName**: (`region`: `string`, `deployment`: `string`) => `string`

#### Type declaration

▸ (`region`, `deployment`): `string`

Returns the name of the IAM policy to create for the the _worker_ component.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

IAM policy name

#### Defined in

[index.ts:654](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L654)

___

### getQueueNamePrefix

• **getQueueNamePrefix**: (`deployment`: `string`) => `string`

#### Type declaration

▸ (`deployment`): `string`

Returns the prefix of the name of the SQS of the _worker_ component.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

Prefix of the SQS queue name

#### Defined in

[index.ts:640](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L640)

___

### getRoleName

• **getRoleName**: (`region`: `string`, `deployment`: `string`) => `string`

#### Type declaration

▸ (`region`, `deployment`): `string`

Returns the name of the IAM role to create for the the _worker_ component.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region |
| `deployment` | `string` | LetsGo deployment name |

##### Returns

`string`

IAM role name

#### Defined in

[index.ts:647](https://github.com/tjanczuk/letsgo/blob/66e0983/packages/constants/src/index.ts#L647)
