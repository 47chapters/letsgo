[@letsgo/stripe](../README.md) / CreateNewSubscriptionOptions

# Interface: CreateNewSubscriptionOptions

Options for creating a new Stripe subscription.

## Table of contents

### Properties

- [customerId](CreateNewSubscriptionOptions.md#customerid)
- [identityId](CreateNewSubscriptionOptions.md#identityid)
- [priceLookupKey](CreateNewSubscriptionOptions.md#pricelookupkey)
- [tenantId](CreateNewSubscriptionOptions.md#tenantid)

## Properties

### customerId

• **customerId**: `string`

Stripe customer ID.

#### Defined in

[index.ts:210](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L210)

___

### identityId

• **identityId**: `string`

Identity of the LetsGo user who initiated the transaction to associate with the Stripe subscription.

#### Defined in

[index.ts:218](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L218)

___

### priceLookupKey

• **priceLookupKey**: `string`

LetsGo plan ID to use as a lookup key to locate a Stripe price to associate with the Stripe subscription.

#### Defined in

[index.ts:222](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L222)

___

### tenantId

• **tenantId**: `string`

LetsGo tenant ID to associate with the Stripe subscription.

#### Defined in

[index.ts:214](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L214)
