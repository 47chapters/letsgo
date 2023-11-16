[@letsgo/tenant](../README.md) / DeleteInvitationOptions

# Interface: DeleteInvitationOptions

Options for deleting an existing invitation.

## Hierarchy

- `DeploymentOptions`

  ↳ **`DeleteInvitationOptions`**

## Table of contents

### Properties

- [deployment](DeleteInvitationOptions.md#deployment)
- [invitationId](DeleteInvitationOptions.md#invitationid)
- [region](DeleteInvitationOptions.md#region)
- [tenantId](DeleteInvitationOptions.md#tenantid)

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

[tenant/src/index.ts:391](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L391)

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

[tenant/src/index.ts:387](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L387)
