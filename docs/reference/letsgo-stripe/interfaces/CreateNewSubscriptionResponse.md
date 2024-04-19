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

[index.ts:262](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L262)

___

### currentPeriodEnd

• **currentPeriodEnd**: `string`

Date and time when the current subscription period ends.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[currentPeriodEnd](SubscriptionResponse.md#currentperiodend)

#### Defined in

[index.ts:240](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L240)

___

### publicKey

• **publicKey**: `string`

Stripe public key to use for the payment form. This may be a _live_ or _test_ key depending
on the Stripe configuration.

#### Defined in

[index.ts:267](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L267)

___

### status

• **status**: `string`

Stripe subscription status.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[status](SubscriptionResponse.md#status)

#### Defined in

[index.ts:236](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L236)

___

### subscriptionId

• **subscriptionId**: `string`

Stripe subscription Id.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[subscriptionId](SubscriptionResponse.md#subscriptionid)

#### Defined in

[index.ts:232](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L232)
