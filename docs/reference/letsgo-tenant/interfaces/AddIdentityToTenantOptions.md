[@letsgo/tenant](../README.md) / AddIdentityToTenantOptions

# Interface: AddIdentityToTenantOptions

Options for adding a new user to a tenant.

## Hierarchy

- `DeploymentOptions`

  ↳ **`AddIdentityToTenantOptions`**

## Table of contents

### Properties

- [deployment](AddIdentityToTenantOptions.md#deployment)
- [identity](AddIdentityToTenantOptions.md#identity)
- [region](AddIdentityToTenantOptions.md#region)
- [tenantId](AddIdentityToTenantOptions.md#tenantid)

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

LetsGo identity.

#### Defined in

[tenant/src/index.ts:727](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L727)

___

### region

• `Optional` **region**: `string`

AWS region.

#### Inherited from

DeploymentOptions.region

#### Defined in

db/dist/index.d.ts:14

___

### tenantId

• **tenantId**: `string`

LetsGo tenant Id.

#### Defined in

[tenant/src/index.ts:723](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L723)
