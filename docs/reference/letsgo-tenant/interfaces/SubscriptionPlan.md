[@letsgo/tenant](../README.md) / SubscriptionPlan

# Interface: SubscriptionPlan

A tenant's subscription plan.

## Table of contents

### Properties

- [changes](SubscriptionPlan.md#changes)
- [planId](SubscriptionPlan.md#planid)
- [stripeCustomerId](SubscriptionPlan.md#stripecustomerid)
- [stripeSubscription](SubscriptionPlan.md#stripesubscription)

## Properties

### changes

• **changes**: [`SubscriptionPlanChange`](SubscriptionPlanChange.md)[]

History of changes of the tenant's subscription plan.

#### Defined in

[tenant/src/index.ts:123](https://github.com/47chapters/letsgo/blob/5310a6f/packages/tenant/src/index.ts#L123)

___

### planId

• **planId**: `string`

The plan ID.

#### Defined in

[tenant/src/index.ts:92](https://github.com/47chapters/letsgo/blob/5310a6f/packages/tenant/src/index.ts#L92)

___

### stripeCustomerId

• `Optional` **stripeCustomerId**: `string`

The Stripe customer ID associated with the tenant. Once established, the Stripe customer Id remains unchanged even
if the tenant's Stripe subscription is canceled and later reactivated.

#### Defined in

[tenant/src/index.ts:97](https://github.com/47chapters/letsgo/blob/5310a6f/packages/tenant/src/index.ts#L97)

___

### stripeSubscription

• `Optional` **stripeSubscription**: `Object`

The tenant's Stripe subscription. This is undefined if the tenant has no Stripe subscription (e.g. is on an unpaid plan
or a custom plan handled outside of Stripe's realm).

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `card?` | `CardInfo` | The tenant's credit card on file. |
| `currentPeriodEnd` | `string` | The timestamp of the end of the current billing period. |
| `status` | `string` | The subscription status. |
| `subscriptionId` | `string` | The Stripe subscription ID. |

#### Defined in

[tenant/src/index.ts:102](https://github.com/47chapters/letsgo/blob/5310a6f/packages/tenant/src/index.ts#L102)
