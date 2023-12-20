[@letsgo/stripe](../README.md) / CompletePaymentSetupResponse

# Interface: CompletePaymentSetupResponse

Parameters describing the result of a completed Stripe payment setup. If the status is successful, the new
credit card information is returned.

## Table of contents

### Properties

- [card](CompletePaymentSetupResponse.md#card)
- [status](CompletePaymentSetupResponse.md#status)

## Properties

### card

• `Optional` **card**: [`CardInfo`](CardInfo.md)

New credit card information if the payment setup was successful.

#### Defined in

[index.ts:386](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L386)

___

### status

• **status**: `string`

Status of the completed Stripe payment setup.

#### Defined in

[index.ts:382](https://github.com/47chapters/letsgo/blob/5310a6f/packages/stripe/src/index.ts#L382)
