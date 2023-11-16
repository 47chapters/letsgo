@letsgo/constants

# @letsgo/constants

This package defines constants that change infrequently:
- naming patterns of AWS resources created by LetsGo,
- IAM policies for the components created by LetsGo,
- default values for configuration settings,
- other infrequently changing configuration values.

## Table of contents

### Interfaces

- [AppRunnerSettings](interfaces/AppRunnerSettings.md)
- [AppRunnerSettingsDefaultConfig](interfaces/AppRunnerSettingsDefaultConfig.md)
- [DBSettings](interfaces/DBSettings.md)
- [DefaultConfig](interfaces/DefaultConfig.md)
- [WorkerSettings](interfaces/WorkerSettings.md)
- [WorkerSettingsDefaultConfig](interfaces/WorkerSettingsDefaultConfig.md)

### Variables

- [ApiConfiguration](README.md#apiconfiguration)
- [ConfigSettings](README.md#configsettings)
- [DBConfiguration](README.md#dbconfiguration)
- [DefaultDeployment](README.md#defaultdeployment)
- [DefaultRegion](README.md#defaultregion)
- [InvitationTtl](README.md#invitationttl)
- [StaticJwtAudience](README.md#staticjwtaudience)
- [StripeApiVersion](README.md#stripeapiversion)
- [StripeIdentityIdMetadataKey](README.md#stripeidentityidmetadatakey)
- [StripePlanIdMetadataKey](README.md#stripeplanidmetadatakey)
- [StripeTenantIdMetadataKey](README.md#stripetenantidmetadatakey)
- [TagKeys](README.md#tagkeys)
- [VendorPrefix](README.md#vendorprefix)
- [WebConfiguration](README.md#webconfiguration)
- [WorkerConfiguration](README.md#workerconfiguration)

## Variables

### ApiConfiguration

• `Const` **ApiConfiguration**: [`AppRunnerSettings`](interfaces/AppRunnerSettings.md)

Parameters that control the creation of an App Runner service and related AWS resources for the _API_ component.

#### Defined in

[index.ts:510](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L510)

___

### ConfigSettings

• `Const` **ConfigSettings**: `Object`

Names of environment variables regognized by LetsGo components which contain
configuration settings controling.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ApiAppRunnerAudience` | `string` | The OAuth `audience` value expected in the access tokens used to access the HTTP API. |
| `ApiAppRunnerCpu` | `string` | The amount of CPU allocated to a single instance of the _API_ component. |
| `ApiAppRunnerHealthHealthyThreshold` | `string` | The number of consecutive successful health checks before the instance of the _API_ component is considered healthy. |
| `ApiAppRunnerHealthInterval` | `string` | Frequency in seconds of the App Runner health check for the _API_ component. |
| `ApiAppRunnerHealthPath` | `string` | The path of the HTTP endpoint used by the App Runner health check to determine if the instance of the _API_ component is healthy. |
| `ApiAppRunnerHealthTimeout` | `string` | The maximum time in seconds the App Runner healh check for the _API component can take before it is considered failed. |
| `ApiAppRunnerHealthUnhealthyThreshold` | `string` | The number of consecutive failed health checks before the instance of the _API_ component is considered unhealthy. |
| `ApiAppRunnerMaxConcurrency` | `string` | The maximum number of concurrent HTTP requests processed by a single instance of the _API_ component. |
| `ApiAppRunnerMaxSize` | `string` | The maxium number of instances of the _API_ component. |
| `ApiAppRunnerMemory` | `string` | The amount of memory allocated to a single instance of the _API_ component. |
| `ApiAppRunnerMinSize` | `string` | The minimum number of instances of the _API_ component to keep running at all times. |
| `ApiAppRunnerUrl` | `string` | Public URL of the _API_ component. |
| `Auth0Audience` | `string` | The OAuth `audience` value expected in the access tokens used to access the _web_ component. |
| `Auth0BaseUrl` | `string` | The base URL of the _web_ component Auth0 uses to redirect the user to after completed authentication. |
| `Auth0ClientId` | `string` | The OAuth client ID of the Auth0 application used by the _web_ component to authenticate users. |
| `Auth0ClientSecret` | `string` | The OAuth client secret of the Auth0 application used by the _web_ component to authenticate users. |
| `Auth0IssuerBaseUrl` | `string` | The base URL of the Auth0 tenant used by the _web_ component to authenticate users. |
| `Auth0Scope` | `string` | The OAuth `scope` value requested from Auth0 when initiating the login transaction. |
| `Auth0Secret` | `string` | A secret used to encrypt the Auth0 cookie used by the _web_ component to represent a logged in user. |
| `SlackUrl` | `string` | The Slack incoming webhook URL used by LetsGo to send notifications. |
| `StripeLiveMode` | `string` | Determines if the Stripe live or test mode us used. Any value other than `1` means the test mode is used. |
| `StripeLivePublicKey` | `string` | The Stripe public key used by LetsGo when running in live mode. |
| `StripeLiveSecretKey` | `string` | The Stripe secret key used by LetsGo when running in live mode. |
| `StripeLiveWebhookKey` | `string` | The Stripe webhook secret used by LetsGo when running in live mode. |
| `StripeTestPublicKey` | `string` | The Stripe public key used by LetsGo when running in test mode. |
| `StripeTestSecretKey` | `string` | The Stripe secret key used by LetsGo when running in test mode. |
| `StripeTestWebhookKey` | `string` | The Stripe webhook secret used by LetsGo when running in test mode. |
| `WebAppRunnerCpu` | `string` | The amount of CPU allocated to a single instance of the _web_ component. |
| `WebAppRunnerHealthHealthyThreshold` | `string` | The number of consecutive successful health checks before the instance of the _web_ component is considered healthy. |
| `WebAppRunnerHealthInterval` | `string` | Frequency in seconds of the App Runner health check for the _web_ component. |
| `WebAppRunnerHealthPath` | `string` | The path of the HTTP endpoint used by the App Runner health check to determine if the instance of the _web_ component is healthy. |
| `WebAppRunnerHealthTimeout` | `string` | The maximum time in seconds the App Runner healh check for the _web_ component can take before it is considered failed. |
| `WebAppRunnerHealthUnhealthyThreshold` | `string` | The number of consecutive failed health checks before the instance of the _web_ component is considered unhealthy. |
| `WebAppRunnerMaxConcurrency` | `string` | The maximum number of concurrent HTTP requests processed by a single instance of the _web_ component. |
| `WebAppRunnerMaxSize` | `string` | The maxium number of instances of the _web_ component. |
| `WebAppRunnerMemory` | `string` | The amount of memory allocated to a single instance of the _web_ component. |
| `WebAppRunnerMinSize` | `string` | The minimum number of instances of the _web_ component to keep running at all times. |
| `WebAppRunnerUrl` | `string` | The public URL of the _Web_ component. |
| `WorkerBatchSize` | `string` | The maximum number of messages the _worker_ component can process in a single invocation of the Lambda function. |
| `WorkerBatchingWindow` | `string` | The maximum time in seconds the _worker_ component waits for more messages to arrive before processing the batch. |
| `WorkerCuncurrency` | `string` | The maximum number of concurrent instances of the _worker_ component. This number multipled by the [WorkerBatchSize](README.md#workerbatchsize) is the upper bound on the number of concurrently processed messages. |
| `WorkerFunctionEphemeralStorage` | `string` | The amount of ephemeral storage allocated to the Lambda function of the _worker_ component, available in the `/tmp` directory. |
| `WorkerFunctionMemory` | `string` | The amount of memory allocated to the Lambda function of the _worker_ component. |
| `WorkerFunctionTimeout` | `string` | The maximum time in seconds the Lambda function of the _worker_ component can run before it is terminated. |
| `WorkerMessageRetentionPeriod` | `string` | The maximum time in seconds an unconsumed message can stay in the SQS queue of the _worker_ component before it is discarded. |
| `WorkerReceiveMessageWaitTime` | `string` | The time in seconds a request for a message from the SQS queue remains pending if no message is available to read. |
| `WorkerVisibilityTimeout` | `string` | The time in seconds a message remains invisible in the SQS queue of the _worker_ component if it did not confirm its processing. |

#### Defined in

[index.ts:76](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L76)

___

### DBConfiguration

• `Const` **DBConfiguration**: [`DBSettings`](interfaces/DBSettings.md)

Parameters that control the creation of the _database_ component.

#### Defined in

[index.ts:581](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L581)

___

### DefaultDeployment

• `Const` **DefaultDeployment**: `string`

The default LetsGo deployment name used by LetsGo CLI commands.

#### Defined in

[index.ts:28](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L28)

___

### DefaultRegion

• `Const` **DefaultRegion**: `string`

The default AWS region used by LetsGo CLI commands.

#### Defined in

[index.ts:23](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L23)

___

### InvitationTtl

• `Const` **InvitationTtl**: `number`

Default validity period of the invitations to join a tenant.

#### Defined in

[index.ts:39](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L39)

___

### StaticJwtAudience

• `Const` **StaticJwtAudience**: ``"letsgo:service"``

The default OAuth `audience` value expected in the access tokens, as well as the default `audience` value
used when creating JWTs using the built-in PKI issuer.

#### Defined in

[index.ts:34](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L34)

___

### StripeApiVersion

• `Const` **StripeApiVersion**: ``"2023-10-16"``

Default version of of Stripe APIs called and Stripe webhooks accepted.

#### Defined in

[index.ts:44](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L44)

___

### StripeIdentityIdMetadataKey

• `Const` **StripeIdentityIdMetadataKey**: ``"letsgo-identityId"``

The name of the Stripe metadata tag that contains the LetsGo identity ID added to Stripe subscriptions.

#### Defined in

[index.ts:54](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L54)

___

### StripePlanIdMetadataKey

• `Const` **StripePlanIdMetadataKey**: ``"letsgo-planId"``

The name of the Stripe metadata tag that contains the LetsGo plan ID added to Stripe subscriptions.

#### Defined in

[index.ts:59](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L59)

___

### StripeTenantIdMetadataKey

• `Const` **StripeTenantIdMetadataKey**: ``"letsgo-tenantId"``

The name of the Stripe metadata tag that contains the LetsGo tenant ID added to Stripe subscriptions.

#### Defined in

[index.ts:49](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L49)

___

### TagKeys

• `Const` **TagKeys**: `Object`

Names of AWS tags added to all AWS resources created by LetsGo.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `LetsGoComponent` | `string` |
| `LetsGoDeployment` | `string` |
| `LetsGoRegion` | `string` |
| `LetsGoUpdated` | `string` |
| `LetsGoVersion` | `string` |

#### Defined in

[index.ts:64](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L64)

___

### VendorPrefix

• `Const` **VendorPrefix**: ``"letsgo"``

The prefix of the name of all AWS resources created by LetsGo. You may want to change it to something
unique to your organization or application. However, you can only do so _before_ you create your first deployment.
Changing this value once the artifacts had been deployed is not supported.

#### Defined in

[index.ts:18](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L18)

___

### WebConfiguration

• `Const` **WebConfiguration**: [`AppRunnerSettings`](interfaces/AppRunnerSettings.md)

Parameters that control the creation of an App Runner service and related AWS resources for the _web_ component.

#### Defined in

[index.ts:537](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L537)

___

### WorkerConfiguration

• `Const` **WorkerConfiguration**: [`WorkerSettings`](interfaces/WorkerSettings.md)

Parameters that control the creation of AWS resources related to the _worker_ component.

#### Defined in

[index.ts:711](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/constants/src/index.ts#L711)
