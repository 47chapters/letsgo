[@letsgo/tenant](../README.md) / SubscriptionPlanChange

# Interface: SubscriptionPlanChange

A change in a tenant's subscription plan.

## Table of contents

### Properties

- [newPlanId](SubscriptionPlanChange.md#newplanid)
- [timestamp](SubscriptionPlanChange.md#timestamp)
- [updatedBy](SubscriptionPlanChange.md#updatedby)

## Properties

### newPlanId

• **newPlanId**: ``null`` \| `string`

The new plan ID the tenant switched to.

#### Defined in

[tenant/src/index.ts:82](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L82)

___

### timestamp

• **timestamp**: `string`

The timestamp of the change.

#### Defined in

[tenant/src/index.ts:74](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L74)

___

### updatedBy

• **updatedBy**: `Identity`

The identity of the user who made the change.

#### Defined in

[tenant/src/index.ts:78](https://github.com/47chapters/letsgo/blob/06da252/packages/tenant/src/index.ts#L78)
