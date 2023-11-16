[@letsgo/tenant](../README.md) / GetInvitationOptions

# Interface: GetInvitationOptions

Options for getting an existing invitation.

## Hierarchy

- `DeploymentOptions`

  ↳ **`GetInvitationOptions`**

## Table of contents

### Properties

- [deployment](GetInvitationOptions.md#deployment)
- [invitationId](GetInvitationOptions.md#invitationid)
- [region](GetInvitationOptions.md#region)
- [tenantId](GetInvitationOptions.md#tenantid)

## Properties

### deployment

• `Optional` **deployment**: `string`

#### Inherited from

DeploymentOptions.deployment

#### Defined in

db/dist/index.d.ts:3

___

### invitationId

• **invitationId**: `string`

The invitation ID.

#### Defined in

[tenant/src/index.ts:361](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L361)

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

The tenant ID the invitation relates to.

#### Defined in

[tenant/src/index.ts:357](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L357)
