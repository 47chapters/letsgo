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

[index.ts:524](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L524)

___

### currentPeriodEnd

• **currentPeriodEnd**: `string`

Date and time when the current subscription period ends.

#### Inherited from

[SubscriptionResponse](SubscriptionResponse.md).[currentPeriodEnd](SubscriptionResponse.md#currentperiodend)

#### Defined in

[index.ts:240](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L240)

___

### planId

• **planId**: `string`

LetsGo plan ID associated with the Stripe subscription.

#### Defined in

[index.ts:520](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L520)

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
