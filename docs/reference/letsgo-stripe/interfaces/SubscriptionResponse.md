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

[index.ts:230](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L230)

___

### status

• **status**: `string`

Stripe subscription status.

#### Defined in

[index.ts:226](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L226)

___

### subscriptionId

• **subscriptionId**: `string`

Stripe subscription Id.

#### Defined in

[index.ts:222](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L222)
