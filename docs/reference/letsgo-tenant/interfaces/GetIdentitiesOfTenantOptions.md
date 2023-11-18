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

LetsGo deployment name.

#### Inherited from

DeploymentOptions.deployment

#### Defined in

db/dist/index.d.ts:18

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

The Id of the tenant whose users are to be returned.

#### Defined in

[tenant/src/index.ts:656](https://github.com/47chapters/letsgo/blob/11c7e19/packages/tenant/src/index.ts#L656)
