[@letsgo/types](../README.md) / TenantDeletedMessage

# Interface: TenantDeletedMessage

Message of [MessageType.TenantDeleted](../enums/MessageType.md#tenantdeleted) type representing the deletion of a new tenant.

## Hierarchy

- [`Message`](Message.md)

  ↳ **`TenantDeletedMessage`**

## Table of contents

### Properties

- [payload](TenantDeletedMessage.md#payload)
- [type](TenantDeletedMessage.md#type)

## Properties

### payload

• **payload**: [`TenantDeletedMessagePayload`](TenantDeletedMessagePayload.md)

Message payload.

#### Overrides

[Message](Message.md).[payload](Message.md#payload)

#### Defined in

[index.ts:303](https://github.com/47chapters/letsgo/blob/06da252/packages/types/src/index.ts#L303)

___

### type

• **type**: [`TenantDeleted`](../enums/MessageType.md#tenantdeleted)

Message type.

#### Overrides

[Message](Message.md).[type](Message.md#type)

#### Defined in

[index.ts:299](https://github.com/47chapters/letsgo/blob/06da252/packages/types/src/index.ts#L299)
