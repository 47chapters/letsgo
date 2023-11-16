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

[index.ts:196](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/types/src/index.ts#L196)

___

### type

• **type**: `string`

Message type.

#### Defined in

[index.ts:192](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/types/src/index.ts#L192)
