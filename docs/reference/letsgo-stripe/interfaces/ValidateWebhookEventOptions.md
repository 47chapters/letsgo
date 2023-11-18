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

[index.ts:94](https://github.com/47chapters/letsgo/blob/11c7e19/packages/stripe/src/index.ts#L94)

___

### signature

• **signature**: `string`

The value of the `Stripe-signature` HTTP request header.

#### Defined in

[index.ts:98](https://github.com/47chapters/letsgo/blob/11c7e19/packages/stripe/src/index.ts#L98)
