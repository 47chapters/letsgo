[@letsgo/stripe](../README.md) / CreateNewPaymentSetupResponse

# Interface: CreateNewPaymentSetupResponse

Parameters describing a newly created Stripe payment setup. This allows the caller to continue
the collection of the new payment method in the front-end.

## Table of contents

### Properties

- [clientSecret](CreateNewPaymentSetupResponse.md#clientsecret)
- [publicKey](CreateNewPaymentSetupResponse.md#publickey)

## Properties

### clientSecret

• **clientSecret**: `string`

Client secret for the Stripe payment intent.

#### Defined in

[index.ts:313](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L313)

___

### publicKey

• **publicKey**: `string`

Stripe public key to use for the payment form. This may be a _live_ or _test_ key depending
on the Stripe configuration.

#### Defined in

[index.ts:318](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L318)
