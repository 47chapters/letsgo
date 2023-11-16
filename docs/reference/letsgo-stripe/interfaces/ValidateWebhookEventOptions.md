[@letsgo/stripe](../README.md) / ValidateWebhookEventOptions

# Interface: ValidateWebhookEventOptions

Options for validating incoming Stripe webhooks.

## Table of contents

### Properties

- [body](ValidateWebhookEventOptions.md#body)
- [signature](ValidateWebhookEventOptions.md#signature)

## Properties

### body

• **body**: `Buffer`

The raw body of the incoming webhook request.

#### Defined in

[index.ts:94](https://github.com/tjanczuk/letsgo/blob/fb7a7f0/packages/stripe/src/index.ts#L94)

___

### signature

• **signature**: `string`

The value of the `Stripe-signature` HTTP request header.

#### Defined in

[index.ts:98](https://github.com/tjanczuk/letsgo/blob/fb7a7f0/packages/stripe/src/index.ts#L98)
