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

[index.ts:353](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L353)

___

### setupIntentId

• **setupIntentId**: `string`

The Stripe setup intent ID that is being completed.

#### Defined in

[index.ts:349](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L349)

___

### subscriptionId

• **subscriptionId**: `string`

The Stripe subscription ID to associate with the new payment method.

#### Defined in

[index.ts:357](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L357)
