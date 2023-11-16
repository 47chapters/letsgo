[@letsgo/stripe](../README.md) / CreateNewSubscriptionResponse

# Interface: CreateNewSubscriptionResponse

Parameters describing newly created Stripe subscription.

## Hierarchy

- [`SubscriptionResponse`](SubscriptionResponse.md)

  ↳ **`CreateNewSubscriptionResponse`**

## Table of contents

### Properties

- [clientSecret](CreateNewSubscriptionResponse.md#clientsecret)
- [currentPeriodEnd](CreateNewSubscriptionResponse.md#currentperiodend)
- [publicKey](CreateNewSubscriptionResponse.md#publickey)
- [status](CreateNewSubscriptionResponse.md#status)
- [subscriptionId](CreateNewSubscriptionResponse.md#subscriptionid)

## Properties

### clientSecret

• **clientSecret**: `string`

Client secret for the Stripe payment intent.

#### Defined in

[index.ts:252](https://github.com/tjanczuk/letsgo/blob/fb7a7f0/packages/stripe/src/index.ts#L252)

___

### currentPeriodEnd

• **currentPeriodEnd**: `string`

Date and time when the current subscription period ends.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[currentPeriodEnd](SubscriptionResponse.md#currentperiodend)

#### Defined in

[index.ts:230](https://github.com/tjanczuk/letsgo/blob/fb7a7f0/packages/stripe/src/index.ts#L230)

___

### publicKey

• **publicKey**: `string`

Stripe public key to use for the payment form. This may be a _live_ or _test_ key depending
on the Stripe configuration.

#### Defined in

[index.ts:257](https://github.com/tjanczuk/letsgo/blob/fb7a7f0/packages/stripe/src/index.ts#L257)

___

### status

• **status**: `string`

Stripe subscription status.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[status](SubscriptionResponse.md#status)

#### Defined in

[index.ts:226](https://github.com/tjanczuk/letsgo/blob/fb7a7f0/packages/stripe/src/index.ts#L226)

___

### subscriptionId

• **subscriptionId**: `string`

Stripe subscription Id.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[subscriptionId](SubscriptionResponse.md#subscriptionid)

#### Defined in

[index.ts:222](https://github.com/tjanczuk/letsgo/blob/fb7a7f0/packages/stripe/src/index.ts#L222)
