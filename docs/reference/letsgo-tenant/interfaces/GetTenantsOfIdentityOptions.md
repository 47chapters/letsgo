[@letsgo/tenant](../README.md) / GetTenantsOfIdentityOptions

# Interface: GetTenantsOfIdentityOptions

Options for getting all tenants a specific user has access to.

## Hierarchy

- `DeploymentOptions`

  ↳ **`GetTenantsOfIdentityOptions`**

## Table of contents

### Properties

- [deployment](GetTenantsOfIdentityOptions.md#deployment)
- [identity](GetTenantsOfIdentityOptions.md#identity)
- [includeDeleted](GetTenantsOfIdentityOptions.md#includedeleted)
- [region](GetTenantsOfIdentityOptions.md#region)

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

• **identity**: `Identity`

The identity of the user whose tenants are to be returned.

#### Defined in

[tenant/src/index.ts:614](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/tenant/src/index.ts#L614)

___

### includeDeleted

• `Optional` **includeDeleted**: `boolean`

If true, the result includes tenants that have been deleted.

#### Defined in

[tenant/src/index.ts:618](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/tenant/src/index.ts#L618)

___

### region

• `Optional` **region**: `string`

AWS region.

#### Inherited from

DeploymentOptions.region

#### Defined in

db/dist/index.d.ts:14
