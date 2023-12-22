[@letsgo/tenant](../README.md) / IsIdentityInTenantOptions

# Interface: IsIdentityInTenantOptions

Options for checking if a user is a member of a tenant.

## Hierarchy

- `DeploymentOptions`

  ↳ **`IsIdentityInTenantOptions`**

## Table of contents

### Properties

- [deployment](IsIdentityInTenantOptions.md#deployment)
- [identityId](IsIdentityInTenantOptions.md#identityid)
- [region](IsIdentityInTenantOptions.md#region)
- [tenantId](IsIdentityInTenantOptions.md#tenantid)

## Properties

### deployment

• `Optional` **deployment**: `string`

LetsGo deployment name.

#### Inherited from

DeploymentOptions.deployment

#### Defined in

db/dist/index.d.ts:18

___

### identityId

• **identityId**: `string`

LetsGo identity Id.

#### Defined in

[tenant/src/index.ts:697](https://github.com/47chapters/letsgo/blob/5310a6f/packages/tenant/src/index.ts#L697)

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

[tenant/src/index.ts:693](https://github.com/47chapters/letsgo/blob/5310a6f/packages/tenant/src/index.ts#L693)
