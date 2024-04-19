[@letsgo/tenant](../README.md) / PutTenantOptions

# Interface: PutTenantOptions

Options for updating an existing tenant.

## Hierarchy

- `DeploymentOptions`

  ↳ **`PutTenantOptions`**

## Table of contents

### Properties

- [deployment](PutTenantOptions.md#deployment)
- [displayName](PutTenantOptions.md#displayname)
- [plan](PutTenantOptions.md#plan)
- [region](PutTenantOptions.md#region)
- [tenantId](PutTenantOptions.md#tenantid)
- [updatedBy](PutTenantOptions.md#updatedby)

## Properties

### deployment

• `Optional` **deployment**: `string`

LetsGo deployment name.

#### Inherited from

DeploymentOptions.deployment

#### Defined in

db/dist/index.d.ts:18

___

### displayName

• `Optional` **displayName**: `string`

The tenant's display name. If not specified, the existing display name is used.

#### Defined in

[tenant/src/index.ts:540](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L540)

___

### plan

• `Optional` **plan**: [`SubscriptionPlan`](SubscriptionPlan.md)

The tenant's updated subscription plan. If not specified, the existing plan is used.

#### Defined in

[tenant/src/index.ts:548](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L548)

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

The ID of the tenant to update.

#### Defined in

[tenant/src/index.ts:536](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L536)

___

### updatedBy

• **updatedBy**: `Identity`

The identity of the user who is updating the tenant.

#### Defined in

[tenant/src/index.ts:544](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L544)
