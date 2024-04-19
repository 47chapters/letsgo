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

[index.ts:444](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L444)

___

### priceLookupKey

• **priceLookupKey**: `string`

LetsGo plan ID to use as a lookup key to locate the new Stripe price to associate with the Stripe subscription.

#### Defined in

[index.ts:448](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L448)

___

### subscriptionId

• **subscriptionId**: `string`

The Stripe subscription ID to update.

#### Defined in

[index.ts:440](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L440)
