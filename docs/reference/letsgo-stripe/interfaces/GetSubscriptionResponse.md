[@letsgo/stripe](../README.md) / GetSubscriptionResponse

# Interface: GetSubscriptionResponse

Parameters describing a Stripe subscription.

## Hierarchy

- [`SubscriptionResponse`](SubscriptionResponse.md)

  ↳ **`GetSubscriptionResponse`**

## Table of contents

### Properties

- [card](GetSubscriptionResponse.md#card)
- [currentPeriodEnd](GetSubscriptionResponse.md#currentperiodend)
- [planId](GetSubscriptionResponse.md#planid)
- [status](GetSubscriptionResponse.md#status)
- [subscriptionId](GetSubscriptionResponse.md#subscriptionid)

## Properties

### card

• `Optional` **card**: [`CardInfo`](CardInfo.md)

Credit card information on file.

#### Defined in

[index.ts:514](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L514)

___

### currentPeriodEnd

• **currentPeriodEnd**: `string`

Date and time when the current subscription period ends.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[currentPeriodEnd](SubscriptionResponse.md#currentperiodend)

#### Defined in

[index.ts:230](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L230)

___

### planId

• **planId**: `string`

LetsGo plan ID associated with the Stripe subscription.

#### Defined in

[index.ts:510](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L510)

___

### status

• **status**: `string`

Stripe subscription status.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[status](SubscriptionResponse.md#status)

#### Defined in

[index.ts:226](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L226)

___

### subscriptionId

• **subscriptionId**: `string`

Stripe subscription Id.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[subscriptionId](SubscriptionResponse.md#subscriptionid)

#### Defined in

[index.ts:222](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L222)
