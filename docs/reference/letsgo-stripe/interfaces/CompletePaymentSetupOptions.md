[@letsgo/stripe](../README.md) / CompletePaymentSetupOptions

# Interface: CompletePaymentSetupOptions

Options for completing a new Stripe payment setup.

## Table of contents

### Properties

- [customerId](CompletePaymentSetupOptions.md#customerid)
- [setupIntentId](CompletePaymentSetupOptions.md#setupintentid)
- [subscriptionId](CompletePaymentSetupOptions.md#subscriptionid)

## Properties

### customerId

• **customerId**: `string`

The Stripe customer ID for whom the payment setup is being completed for.

#### Defined in

[index.ts:352](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L352)

___

### setupIntentId

• **setupIntentId**: `string`

The Stripe setup intent ID that is being completed.

#### Defined in

[index.ts:348](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L348)

___

### subscriptionId

• **subscriptionId**: `string`

The Stripe subscription ID to associate with the new payment method.

#### Defined in

[index.ts:356](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/stripe/src/index.ts#L356)
