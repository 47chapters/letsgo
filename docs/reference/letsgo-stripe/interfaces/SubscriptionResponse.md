[@letsgo/stripe](../README.md) / SubscriptionResponse

# Interface: SubscriptionResponse

Parameters describing a Stripe subscription.

## Hierarchy

- **`SubscriptionResponse`**

  ↳ [`CreateNewSubscriptionResponse`](CreateNewSubscriptionResponse.md)

  ↳ [`GetSubscriptionResponse`](GetSubscriptionResponse.md)

## Table of contents

### Properties

- [currentPeriodEnd](SubscriptionResponse.md#currentperiodend)
- [status](SubscriptionResponse.md#status)
- [subscriptionId](SubscriptionResponse.md#subscriptionid)

## Properties

### currentPeriodEnd

• **currentPeriodEnd**: `string`

Date and time when the current subscription period ends.

#### Defined in

[index.ts:240](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L240)

___

### status

• **status**: `string`

Stripe subscription status.

#### Defined in

[index.ts:236](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L236)

___

### subscriptionId

• **subscriptionId**: `string`

Stripe subscription Id.

#### Defined in

[index.ts:232](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L232)
