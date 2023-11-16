[@letsgo/tenant](../README.md) / GetIdentitiesOfTenantOptions

# Interface: GetIdentitiesOfTenantOptions

Options for getting all users of a specific tenant.

## Hierarchy

- `DeploymentOptions`

  ↳ **`GetIdentitiesOfTenantOptions`**

## Table of contents

### Properties

- [deployment](GetIdentitiesOfTenantOptions.md#deployment)
- [region](GetIdentitiesOfTenantOptions.md#region)
- [tenantId](GetIdentitiesOfTenantOptions.md#tenantid)

## Properties

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

The Id of the tenant whose users are to be returned.

#### Defined in

[tenant/src/index.ts:656](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L656)
