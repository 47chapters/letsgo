[@letsgo/trust](../README.md) / PutIdentityOptions

# Interface: PutIdentityOptions

Options for upserting an identity to the database.

## Hierarchy

- [`IdentityOptions`](IdentityOptions.md)

  ↳ **`PutIdentityOptions`**

## Table of contents

### Properties

- [deployment](PutIdentityOptions.md#deployment)
- [identity](PutIdentityOptions.md#identity)
- [identityId](PutIdentityOptions.md#identityid)
- [region](PutIdentityOptions.md#region)
- [user](PutIdentityOptions.md#user)

## Properties

### deployment

• `Optional` **deployment**: `string`

LetsGo deployment name.

#### Inherited from

[IdentityOptions](IdentityOptions.md).[deployment](IdentityOptions.md#deployment)

#### Defined in

db/dist/index.d.ts:18

___

### identity

• `Optional` **identity**: [`Identity`](Identity.md)

The deserialized identity of the user.

#### Inherited from

[IdentityOptions](IdentityOptions.md).[identity](IdentityOptions.md#identity)

#### Defined in

[trust/src/identity.ts:32](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/trust/src/identity.ts#L32)

___

### identityId

• `Optional` **identityId**: `string`

The serialized identityId of the user.

#### Inherited from

[IdentityOptions](IdentityOptions.md).[identityId](IdentityOptions.md#identityid)

#### Defined in

[trust/src/identity.ts:28](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/trust/src/identity.ts#L28)

___

### region

• `Optional` **region**: `string`

AWS region.

#### Inherited from

[IdentityOptions](IdentityOptions.md).[region](IdentityOptions.md#region)

#### Defined in

db/dist/index.d.ts:14

___

### user

• **user**: [`Claims`](Claims.md)

Claims describing the user.

#### Defined in

[trust/src/identity.ts:42](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/trust/src/identity.ts#L42)
