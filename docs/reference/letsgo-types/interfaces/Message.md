[@letsgo/types](../README.md) / Message

# Interface: Message

A message sent to the _worker_ component.

## Hierarchy

- **`Message`**

  ↳ [`ContactMessage`](ContactMessage.md)

  ↳ [`TenantNewMessage`](TenantNewMessage.md)

  ↳ [`TenantDeletedMessage`](TenantDeletedMessage.md)

  ↳ [`StripeMessage`](StripeMessage.md)

## Table of contents

### Properties

- [payload](Message.md#payload)
- [type](Message.md#type)

## Properties

### payload

• **payload**: `any`

Message payload.

#### Defined in

[index.ts:195](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L195)

___

### type

• **type**: `string`

Message type.

#### Defined in

[index.ts:191](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L191)
