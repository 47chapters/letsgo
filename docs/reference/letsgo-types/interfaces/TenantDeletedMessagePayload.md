[@letsgo/types](../README.md) / TenantDeletedMessagePayload

# Interface: TenantDeletedMessagePayload

Payload of a message of [MessageType.TenantDeleted](../enums/MessageType.md#tenantdeleted) type representing the deletion of a new tenant.

## Table of contents

### Properties

- [cancelledPlanId](TenantDeletedMessagePayload.md#cancelledplanid)
- [tenant](TenantDeletedMessagePayload.md#tenant)

## Properties

### cancelledPlanId

• **cancelledPlanId**: `string`

The ID of the plan the tenant was on when it was deleted.

#### Defined in

[index.ts:289](https://github.com/47chapters/letsgo/blob/5310a6f/packages/types/src/index.ts#L289)

___

### tenant

• **tenant**: `Tenant`

The deleted tenant.

#### Defined in

[index.ts:285](https://github.com/47chapters/letsgo/blob/5310a6f/packages/types/src/index.ts#L285)
