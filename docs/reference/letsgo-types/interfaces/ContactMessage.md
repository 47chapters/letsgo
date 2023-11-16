[@letsgo/types](../README.md) / ContactMessage

# Interface: ContactMessage

Message of [MessageType.Contact](../enums/MessageType.md#contact) type representing the contact form submission.

## Hierarchy

- [`Message`](Message.md)

  ↳ **`ContactMessage`**

## Table of contents

### Properties

- [payload](ContactMessage.md#payload)
- [type](ContactMessage.md#type)

## Properties

### payload

• **payload**: [`ContactMessagePayload`](ContactMessagePayload.md)

Message payload.

#### Overrides

[Message](Message.md).[payload](Message.md#payload)

#### Defined in

[index.ts:246](https://github.com/tjanczuk/letsgo/blob/4d5649a/packages/types/src/index.ts#L246)

___

### type

• **type**: [`Contact`](../enums/MessageType.md#contact)

Message type.

#### Overrides

[Message](Message.md).[type](Message.md#type)

#### Defined in

[index.ts:242](https://github.com/tjanczuk/letsgo/blob/4d5649a/packages/types/src/index.ts#L242)
