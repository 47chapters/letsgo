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

[index.ts:200](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L200)

___

### identityId

• **identityId**: `string`

Identity of the LetsGo user who initiated the transaction to associate with the Stripe subscription.

#### Defined in

[index.ts:208](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L208)

___

### priceLookupKey

• **priceLookupKey**: `string`

LetsGo plan ID to use as a lookup key to locate a Stripe price to associate with the Stripe subscription.

#### Defined in

[index.ts:212](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L212)

___

### tenantId

• **tenantId**: `string`

LetsGo tenant ID to associate with the Stripe subscription.

#### Defined in

[index.ts:204](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L204)
