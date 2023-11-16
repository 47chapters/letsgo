[@letsgo/stripe](../README.md) / CancelSubscriptionOptions

# Interface: CancelSubscriptionOptions

Options for canceling an existing Stripe subscription.

## Table of contents

### Properties

- [identityId](CancelSubscriptionOptions.md#identityid)
- [subscriptionId](CancelSubscriptionOptions.md#subscriptionid)

## Properties

### identityId

• **identityId**: `string`

Identity of the LetsGo user who initiated the transaction to cancel the Stripe subscription.

#### Defined in

[index.ts:477](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L477)

___

### subscriptionId

• **subscriptionId**: `string`

The Stripe subscription ID to cancel.

#### Defined in

[index.ts:473](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L473)
