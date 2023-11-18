[@letsgo/types](../README.md) / StripeMessage

# Interface: StripeMessage

Message of [MessageType.Stripe](../enums/MessageType.md#stripe) type representing the Stripe webhook event.

## Hierarchy

- [`Message`](Message.md)

  ↳ **`StripeMessage`**

## Table of contents

### Properties

- [payload](StripeMessage.md#payload)
- [type](StripeMessage.md#type)

## Properties

### payload

• **payload**: `Object`

Stripe event

#### Index signature

▪ [key: `string`]: `any`

Other event properties.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `string` | Stripe event type |

#### Overrides

[Message](Message.md).[payload](Message.md#payload)

#### Defined in

[index.ts:314](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L314)

___

### type

• **type**: [`Stripe`](../enums/MessageType.md#stripe)

Message type.

#### Overrides

[Message](Message.md).[type](Message.md#type)

#### Defined in

[index.ts:310](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L310)
