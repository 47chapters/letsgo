[@letsgo/types](../README.md) / PostPlanResponse

# Interface: PostPlanResponse

Response to a request to switch a tenant to a new plan. This response is only generated if the new plan
requires a new payment method from Stripe.

## Table of contents

### Properties

- [clientSecret](PostPlanResponse.md#clientsecret)
- [publicKey](PostPlanResponse.md#publickey)
- [subscriptionId](PostPlanResponse.md#subscriptionid)

## Properties

### clientSecret

• **clientSecret**: `string`

Stripe client secret to continue processing a new payment intent.

#### Defined in

[index.ts:141](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L141)

___

### publicKey

• **publicKey**: `string`

Stripe public key.

#### Defined in

[index.ts:145](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L145)

___

### subscriptionId

• **subscriptionId**: `string`

Stripe subscrption Id.

#### Defined in

[index.ts:137](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L137)
