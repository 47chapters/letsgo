@letsgo/stripe

# @letsgo/stripe

This package consolidates all interactions between LetsGo and Stripe APIs. It provides facility functions specific
to the LetsGo use cases which wrap relevant Stripe API calls.

## Table of contents

### Interfaces

- [CancelSubscriptionOptions](interfaces/CancelSubscriptionOptions.md)
- [CardInfo](interfaces/CardInfo.md)
- [CompletePaymentSetupOptions](interfaces/CompletePaymentSetupOptions.md)
- [CompletePaymentSetupResponse](interfaces/CompletePaymentSetupResponse.md)
- [CreateCustomerOptions](interfaces/CreateCustomerOptions.md)
- [CreateNewPaymentSetupOptions](interfaces/CreateNewPaymentSetupOptions.md)
- [CreateNewPaymentSetupResponse](interfaces/CreateNewPaymentSetupResponse.md)
- [CreateNewSubscriptionOptions](interfaces/CreateNewSubscriptionOptions.md)
- [CreateNewSubscriptionResponse](interfaces/CreateNewSubscriptionResponse.md)
- [GetSubscriptionResponse](interfaces/GetSubscriptionResponse.md)
- [StripeConfiguration](interfaces/StripeConfiguration.md)
- [SubscriptionResponse](interfaces/SubscriptionResponse.md)
- [UpdateSubscriptionOptions](interfaces/UpdateSubscriptionOptions.md)
- [ValidateWebhookEventOptions](interfaces/ValidateWebhookEventOptions.md)

### Type Aliases

- [StripeMode](README.md#stripemode)

### Functions

- [cancelSubscription](README.md#cancelsubscription)
- [completePaymentSetup](README.md#completepaymentsetup)
- [createCustomer](README.md#createcustomer)
- [createNewPaymentSetup](README.md#createnewpaymentsetup)
- [createNewSubscription](README.md#createnewsubscription)
- [getPrice](README.md#getprice)
- [getStripeConfiguration](README.md#getstripeconfiguration)
- [getSubscription](README.md#getsubscription)
- [tryGetPrice](README.md#trygetprice)
- [updateSubscription](README.md#updatesubscription)
- [validateWebhookEvent](README.md#validatewebhookevent)

## Type Aliases

### StripeMode

Ƭ **StripeMode**: ``"LIVE"`` \| ``"TEST"``

Stripe mode for the API client.

#### Defined in

[index.ts:20](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L20)

## Functions

### cancelSubscription

▸ **cancelSubscription**(`options`): `Promise`\<[`SubscriptionResponse`](interfaces/SubscriptionResponse.md)\>

Cancels an existing Stipe subscription. The subscription will be canceled at the end of the current billing period,
and no refunds will be issued.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CancelSubscriptionOptions`](interfaces/CancelSubscriptionOptions.md) | Options for canceling an existing Stripe subscription. |

#### Returns

`Promise`\<[`SubscriptionResponse`](interfaces/SubscriptionResponse.md)\>

Updated Stripe subscription.

#### Defined in

[index.ts:497](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L497)

___

### completePaymentSetup

▸ **completePaymentSetup**(`options`): `Promise`\<[`CompletePaymentSetupResponse`](interfaces/CompletePaymentSetupResponse.md)\>

Completes an update of a payment method for a Stripe subscription. If the update was successful,
the new payment method is stored as the default payment method for the customer and the subscription.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CompletePaymentSetupOptions`](interfaces/CompletePaymentSetupOptions.md) | Options for completing a new Stripe payment setup. |

#### Returns

`Promise`\<[`CompletePaymentSetupResponse`](interfaces/CompletePaymentSetupResponse.md)\>

Parameters describing the result of a completed Stripe payment setup.

#### Defined in

[index.ts:405](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L405)

___

### createCustomer

▸ **createCustomer**(`options`): `Promise`\<`Stripe.Customer`\>

Creates a new Stripe customer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CreateCustomerOptions`](interfaces/CreateCustomerOptions.md) | Options for creating a new customer. |

#### Returns

`Promise`\<`Stripe.Customer`\>

New Stripe customer.

#### Defined in

[index.ts:157](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L157)

___

### createNewPaymentSetup

▸ **createNewPaymentSetup**(`options`): `Promise`\<[`CreateNewPaymentSetupResponse`](interfaces/CreateNewPaymentSetupResponse.md)\>

Creates a new Stripe payment setup to update a customer's payment method and returns a a client secret
representing the Stripe payment intent. This allows the caller to continue the processing the payment method update
for in the front-end.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CreateNewPaymentSetupOptions`](interfaces/CreateNewPaymentSetupOptions.md) | Options for creating a new Stripe payment setup. |

#### Returns

`Promise`\<[`CreateNewPaymentSetupResponse`](interfaces/CreateNewPaymentSetupResponse.md)\>

Parameters describing the newly created Stripe payment setup including the payment intent.

#### Defined in

[index.ts:338](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L338)

___

### createNewSubscription

▸ **createNewSubscription**(`options`): `Promise`\<[`CreateNewSubscriptionResponse`](interfaces/CreateNewSubscriptionResponse.md)\>

Creates a new Stripe subscription and returns a a client secret representing the Stripe payment intent.
This allows the caller to continue the processing the payment for the subscription in the front-end.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CreateNewSubscriptionOptions`](interfaces/CreateNewSubscriptionOptions.md) | Options for creating a new Stripe subscription. |

#### Returns

`Promise`\<[`CreateNewSubscriptionResponse`](interfaces/CreateNewSubscriptionResponse.md)\>

Parameters describing the newly created Stripe subscription including the payment intent.

#### Defined in

[index.ts:276](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L276)

___

### getPrice

▸ **getPrice**(`lookupKey`): `Promise`\<`Stripe.Price`\>

Returns a Stripe price associated with the provided lookup key or throws an exception if none can be found.
The lookup key is the LetsGo plan ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `lookupKey` | `string` | Lookup key expected to be associated with a Stripe price. This is the LetsGo plan ID. |

#### Returns

`Promise`\<`Stripe.Price`\>

The Stripe price with the specified lookup key.

#### Defined in

[index.ts:195](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L195)

___

### getStripeConfiguration

▸ **getStripeConfiguration**(`mode?`): [`StripeConfiguration`](interfaces/StripeConfiguration.md)

Determine the Stripe configuration based on the environment variables. If the _mode_ parameter is not specified,
the mode is selected using the value of the `LETSGO_STRIPE_LIVE_MODE`
environment variable. Based on the mode, the configuration will use environment variables specific to the
_live_ or _test_ mode to determine the public, secret, and webhook keys for Stripe.

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode?` | [`StripeMode`](README.md#stripemode) |

#### Returns

[`StripeConfiguration`](interfaces/StripeConfiguration.md)

#### Defined in

[index.ts:46](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L46)

___

### getSubscription

▸ **getSubscription**(`subscriptionId`): `Promise`\<[`GetSubscriptionResponse`](interfaces/GetSubscriptionResponse.md) \| `undefined`\>

Returns a Stripe subscription with the specified ID or `undefined` if it cannot be found.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `subscriptionId` | `string` | Stripe subscription Id. |

#### Returns

`Promise`\<[`GetSubscriptionResponse`](interfaces/GetSubscriptionResponse.md) \| `undefined`\>

Select parameters of a Stripe subscription with the specified ID or `undefined` if it cannot be found.

#### Defined in

[index.ts:532](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L532)

___

### tryGetPrice

▸ **tryGetPrice**(`lookupKey`): `Promise`\<`Stripe.Price` \| `undefined`\>

Tries to locate a Stripe price using the provided lookup key. The lookup key is the LetsGo plan ID.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `lookupKey` | `string` | Lookup key expected to be associated with a Stripe price. This is the LetsGo plan ID. |

#### Returns

`Promise`\<`Stripe.Price` \| `undefined`\>

The Stripe price with the specified lookup key or undefined if not found.

#### Defined in

[index.ts:178](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L178)

___

### updateSubscription

▸ **updateSubscription**(`options`): `Promise`\<[`SubscriptionResponse`](interfaces/SubscriptionResponse.md)\>

Changes the Stripe price associated with an existing Stripe subscription.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`UpdateSubscriptionOptions`](interfaces/UpdateSubscriptionOptions.md) | Options for updating an existing Stripe subscription. |

#### Returns

`Promise`\<[`SubscriptionResponse`](interfaces/SubscriptionResponse.md)\>

Updated Stripe subscription.

#### Defined in

[index.ts:456](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L456)

___

### validateWebhookEvent

▸ **validateWebhookEvent**(`options`): `Promise`\<`Stripe.Event`\>

Validates signature of the incoming webhook event. Returns the event if the signature is valid or throws an error.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ValidateWebhookEventOptions`](interfaces/ValidateWebhookEventOptions.md) | Options for validating the webhook event. |

#### Returns

`Promise`\<`Stripe.Event`\>

Validated Stripe event.

#### Defined in

[index.ts:116](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L116)
