[@letsgo/stripe](../README.md) / CreateCustomerOptions

# Interface: CreateCustomerOptions

Options for creating a new Stripe customer.

## Table of contents

### Properties

- [email](CreateCustomerOptions.md#email)
- [identityId](CreateCustomerOptions.md#identityid)
- [name](CreateCustomerOptions.md#name)
- [tenantId](CreateCustomerOptions.md#tenantid)

## Properties

### email

• `Optional` **email**: `string`

Email address to associate with the customer in Stripe. This is the e-mail address of form the user profile
of the LetsGo user who initiated the transaction, if available.

#### Defined in

[index.ts:139](https://github.com/47chapters/letsgo/blob/11c7e19/packages/stripe/src/index.ts#L139)

___

### identityId

• **identityId**: `string`

Identity of the LetsGo user who initiated the transaction to associate with the Stripe customer.

#### Defined in

[index.ts:130](https://github.com/47chapters/letsgo/blob/11c7e19/packages/stripe/src/index.ts#L130)

___

### name

• `Optional` **name**: `string`

Friendly name of the customer in Stripe.

#### Defined in

[index.ts:134](https://github.com/47chapters/letsgo/blob/11c7e19/packages/stripe/src/index.ts#L134)

___

### tenantId

• **tenantId**: `string`

LetsGo tenant ID to associate with the Stripe customer.

#### Defined in

[index.ts:126](https://github.com/47chapters/letsgo/blob/11c7e19/packages/stripe/src/index.ts#L126)
