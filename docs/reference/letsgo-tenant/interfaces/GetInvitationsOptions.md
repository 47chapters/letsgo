[@letsgo/tenant](../README.md) / GetInvitationsOptions

# Interface: GetInvitationsOptions

Options for getting all invitations for a given tenant.

## Hierarchy

- `DeploymentOptions`

  ↳ **`GetInvitationsOptions`**

## Table of contents

### Properties

- [deployment](GetInvitationsOptions.md#deployment)
- [region](GetInvitationsOptions.md#region)
- [tenantId](GetInvitationsOptions.md#tenantid)

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

The tenant ID the invitations relate to.

#### Defined in

[tenant/src/index.ts:415](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/tenant/src/index.ts#L415)
