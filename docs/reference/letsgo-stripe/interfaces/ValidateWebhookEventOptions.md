[@letsgo/stripe](../README.md) / ValidateWebhookEventOptions

# Interface: ValidateWebhookEventOptions

Options for validating incoming Stripe webhooks.

## Table of contents

### Properties

- [body](ValidateWebhookEventOptions.md#body)
- [mode](ValidateWebhookEventOptions.md#mode)
- [signature](ValidateWebhookEventOptions.md#signature)

## Properties

### body

• **body**: `Buffer`

The raw body of the incoming webhook request.

#### Defined in

[index.ts:100](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L100)

___

### mode

• **mode**: [`StripeMode`](../README.md#stripemode)

The mode of the Stripe environment that sent the webhook event.

#### Defined in

[index.ts:108](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L108)

___

### signature

• **signature**: `string`

The value of the `Stripe-signature` HTTP request header.

#### Defined in

[index.ts:104](https://github.com/47chapters/letsgo/blob/06da252/packages/stripe/src/index.ts#L104)
