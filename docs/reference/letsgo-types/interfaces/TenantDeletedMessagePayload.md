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

[index.ts:284](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L284)

___

### tenant

• **tenant**: `Tenant`

The deleted tenant.

#### Defined in

[index.ts:280](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L280)
