[@letsgo/stripe](../README.md) / UpdateSubscriptionOptions

# Interface: UpdateSubscriptionOptions

Options for updating an existing Stripe subscription to change the Stripe price associated with it.

## Table of contents

### Properties

- [identityId](UpdateSubscriptionOptions.md#identityid)
- [priceLookupKey](UpdateSubscriptionOptions.md#pricelookupkey)
- [subscriptionId](UpdateSubscriptionOptions.md#subscriptionid)

## Properties

### identityId

• **identityId**: `string`

Identity of the LetsGo user who initiated the transaction to update the Stripe subscription.

#### Defined in

[index.ts:434](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L434)

___

### priceLookupKey

• **priceLookupKey**: `string`

LetsGo plan ID to use as a lookup key to locate the new Stripe price to associate with the Stripe subscription.

#### Defined in

[index.ts:438](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L438)

___

### subscriptionId

• **subscriptionId**: `string`

The Stripe subscription ID to update.

#### Defined in

[index.ts:430](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L430)
