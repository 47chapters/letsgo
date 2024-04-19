[@letsgo/tenant](../README.md) / Invitation

# Interface: Invitation

An invitation for a new user to join a tenant.

## Hierarchy

- `DBItem`

  ↳ **`Invitation`**

## Table of contents

### Properties

- [category](Invitation.md#category)
- [createdAt](Invitation.md#createdat)
- [createdBy](Invitation.md#createdby)
- [expiresAt](Invitation.md#expiresat)
- [invitationId](Invitation.md#invitationid)
- [key](Invitation.md#key)
- [ttl](Invitation.md#ttl)

## Properties

### category

• **category**: `string`

The DynamoDB partition key.

#### Inherited from

DBItem.category

#### Defined in

db/dist/index.d.ts:49

___

### createdAt

• **createdAt**: `string`

The timestamp of the invitation's creation.

#### Defined in

[tenant/src/index.ts:184](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L184)

___

### createdBy

• **createdBy**: `Identity`

The identity of the user who created the invitation.

#### Defined in

[tenant/src/index.ts:180](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L180)

___

### expiresAt

• **expiresAt**: `string`

The timestamp of the invitation's expiration.

#### Defined in

[tenant/src/index.ts:188](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L188)

___

### invitationId

• **invitationId**: `string`

The invitation ID. This is unique within a tenant.

#### Defined in

[tenant/src/index.ts:176](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L176)

___

### key

• **key**: `string`

The DynamoDB sort key.

#### Inherited from

DBItem.key

#### Defined in

db/dist/index.d.ts:53

___

### ttl

• **ttl**: `number`

The time-to-live of the invitation in seconds.

#### Overrides

DBItem.ttl

#### Defined in

[tenant/src/index.ts:192](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L192)
