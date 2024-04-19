[@letsgo/trust](../README.md) / IdentityOptions

# Interface: IdentityOptions

Options for getting or deleting an identity from the database. Either `identityId` or `identity` must be provided.

## Hierarchy

- `DeploymentOptions`

  ↳ **`IdentityOptions`**

  ↳↳ [`PutIdentityOptions`](PutIdentityOptions.md)

## Table of contents

### Properties

- [deployment](IdentityOptions.md#deployment)
- [identity](IdentityOptions.md#identity)
- [identityId](IdentityOptions.md#identityid)
- [region](IdentityOptions.md#region)

## Properties

### deployment

• `Optional` **deployment**: `string`

LetsGo deployment name.

#### Inherited from

DeploymentOptions.deployment

#### Defined in

db/dist/index.d.ts:18

___

### identity

• `Optional` **identity**: [`Identity`](Identity.md)

The deserialized identity of the user.

#### Defined in

[trust/src/identity.ts:32](https://github.com/47chapters/letsgo/blob/06da252/packages/trust/src/identity.ts#L32)

___

### identityId

• `Optional` **identityId**: `string`

The serialized identityId of the user.

#### Defined in

[trust/src/identity.ts:28](https://github.com/47chapters/letsgo/blob/06da252/packages/trust/src/identity.ts#L28)

___

### region

• `Optional` **region**: `string`

AWS region.

#### Inherited from

DeploymentOptions.region

#### Defined in

db/dist/index.d.ts:14
