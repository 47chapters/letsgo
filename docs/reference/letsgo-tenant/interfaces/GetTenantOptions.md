[@letsgo/tenant](../README.md) / GetTenantOptions

# Interface: GetTenantOptions

Options for getting an existing tenant.

## Hierarchy

- `DeploymentOptions`

  ↳ **`GetTenantOptions`**

## Table of contents

### Properties

- [deployment](GetTenantOptions.md#deployment)
- [includeDeleted](GetTenantOptions.md#includedeleted)
- [region](GetTenantOptions.md#region)
- [tenantId](GetTenantOptions.md#tenantid)

## Properties

### deployment

• `Optional` **deployment**: `string`

LetsGo deployment name.

#### Inherited from

DeploymentOptions.deployment

#### Defined in

db/dist/index.d.ts:18

___

### includeDeleted

• `Optional` **includeDeleted**: `boolean`

If true, the tenant is returned even if it is deleted (i.e. it's `deletedAt` property is set)

#### Defined in

[tenant/src/index.ts:508](https://github.com/47chapters/letsgo/blob/11c7e19/packages/tenant/src/index.ts#L508)

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

The ID of the tenant to get.

#### Defined in

[tenant/src/index.ts:504](https://github.com/47chapters/letsgo/blob/11c7e19/packages/tenant/src/index.ts#L504)
