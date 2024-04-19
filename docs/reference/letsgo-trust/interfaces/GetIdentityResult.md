[@letsgo/trust](../README.md) / GetIdentityResult

# Interface: GetIdentityResult

The result of getting an identity from the database.

## Hierarchy

- `DBItem`

  ↳ **`GetIdentityResult`**

## Table of contents

### Properties

- [category](GetIdentityResult.md#category)
- [identityId](GetIdentityResult.md#identityid)
- [key](GetIdentityResult.md#key)
- [ttl](GetIdentityResult.md#ttl)
- [updatedAt](GetIdentityResult.md#updatedat)
- [user](GetIdentityResult.md#user)

## Properties

### category

• **category**: `string`

The DynamoDB partition key.

#### Inherited from

DBItem.category

#### Defined in

db/dist/index.d.ts:49

___

### identityId

• **identityId**: `string`

The serialized identityId of the user.

#### Defined in

[trust/src/identity.ts:72](https://github.com/47chapters/letsgo/blob/06da252/packages/trust/src/identity.ts#L72)

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

• `Optional` **ttl**: `number`

The time-to-live (TTL) value for the item.

#### Inherited from

DBItem.ttl

#### Defined in

db/dist/index.d.ts:57

___

### updatedAt

• **updatedAt**: `string`

The timestamp of the last update to the identity.

#### Defined in

[trust/src/identity.ts:80](https://github.com/47chapters/letsgo/blob/06da252/packages/trust/src/identity.ts#L80)

___

### user

• **user**: [`Claims`](Claims.md)

Claims describing the user.

#### Defined in

[trust/src/identity.ts:76](https://github.com/47chapters/letsgo/blob/06da252/packages/trust/src/identity.ts#L76)
