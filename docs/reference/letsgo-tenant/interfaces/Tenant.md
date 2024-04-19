[@letsgo/tenant](../README.md) / Tenant

# Interface: Tenant

A LetsGo tenant.

## Hierarchy

- `DBItem`

  ↳ **`Tenant`**

## Table of contents

### Properties

- [category](Tenant.md#category)
- [createdAt](Tenant.md#createdat)
- [createdBy](Tenant.md#createdby)
- [deletedAt](Tenant.md#deletedat)
- [deletedBy](Tenant.md#deletedby)
- [displayName](Tenant.md#displayname)
- [key](Tenant.md#key)
- [plan](Tenant.md#plan)
- [tenantId](Tenant.md#tenantid)
- [ttl](Tenant.md#ttl)
- [updatedAt](Tenant.md#updatedat)
- [updatedBy](Tenant.md#updatedby)

## Properties

### category

• **category**: `string`

The DynamoDB partition key.

#### Inherited from

DBItem.category

#### Defined in

db/dist/index.d.ts:49

___

### createdAt

• **createdAt**: `string`

The timestamp of the tenant's creation.

#### Defined in

[tenant/src/index.ts:141](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L141)

___

### createdBy

• **createdBy**: `Identity`

The identity of the user who created the tenant.

#### Defined in

[tenant/src/index.ts:145](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L145)

___

### deletedAt

• `Optional` **deletedAt**: `string`

The timestamp of the tenant's deletion. If this is undefined, the tenant is not deleted. If it is present,
the tenant is considered non-exitent in the UX of the end user.

#### Defined in

[tenant/src/index.ts:158](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L158)

___

### deletedBy

• `Optional` **deletedBy**: `Identity`

The identity of the user who deleted the tenant.

#### Defined in

[tenant/src/index.ts:162](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L162)

___

### displayName

• **displayName**: `string`

The tenant's display name. This does not need to be unique in the system.

#### Defined in

[tenant/src/index.ts:137](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L137)

___

### key

• **key**: `string`

The DynamoDB sort key.

#### Inherited from

DBItem.key

#### Defined in

db/dist/index.d.ts:53

___

### plan

• **plan**: [`SubscriptionPlan`](SubscriptionPlan.md)

The tenant's subscription plan. A tenant is _always_ associated with a subscription plan, even if it is a free plan.

#### Defined in

[tenant/src/index.ts:166](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L166)

___

### tenantId

• **tenantId**: `string`

The tenant ID. This is unique in the system.

#### Defined in

[tenant/src/index.ts:133](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L133)

___

### ttl

• `Optional` **ttl**: `number`

The time-to-live (TTL) value for the item.

#### Inherited from

DBItem.ttl

#### Defined in

db/dist/index.d.ts:57

___

### updatedAt

• **updatedAt**: `string`

The timestamp of the last update to the tenant.

#### Defined in

[tenant/src/index.ts:149](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L149)

___

### updatedBy

• **updatedBy**: `Identity`

The identity of the user who last updated the tenant.

#### Defined in

[tenant/src/index.ts:153](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L153)
