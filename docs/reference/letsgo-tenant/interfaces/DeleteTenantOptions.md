[@letsgo/tenant](../README.md) / DeleteTenantOptions

# Interface: DeleteTenantOptions

Options for deleting an existing tenant.

## Hierarchy

- `DeploymentOptions`

  ↳ **`DeleteTenantOptions`**

## Table of contents

### Properties

- [deletedBy](DeleteTenantOptions.md#deletedby)
- [deployment](DeleteTenantOptions.md#deployment)
- [region](DeleteTenantOptions.md#region)
- [tenantId](DeleteTenantOptions.md#tenantid)

## Properties

### deletedBy

• **deletedBy**: `Identity`

The identity of the user who is deleting the tenant.

#### Defined in

[tenant/src/index.ts:583](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L583)

___

### deployment

• `Optional` **deployment**: `string`

#### Inherited from

DeploymentOptions.deployment

#### Defined in

db/dist/index.d.ts:3

___

### region

• `Optional` **region**: `string`

#### Inherited from

DeploymentOptions.region

#### Defined in

db/dist/index.d.ts:2

___

### tenantId

• **tenantId**: `string`

The ID of the tenant to delete.

#### Defined in

[tenant/src/index.ts:579](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L579)
