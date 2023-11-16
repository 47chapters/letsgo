[@letsgo/tenant](../README.md) / CreateInvitationOptions

# Interface: CreateInvitationOptions

Options for creating an invitation to join a tenant.

## Hierarchy

- `DeploymentOptions`

  ↳ **`CreateInvitationOptions`**

## Table of contents

### Properties

- [createdBy](CreateInvitationOptions.md#createdby)
- [deployment](CreateInvitationOptions.md#deployment)
- [region](CreateInvitationOptions.md#region)
- [tenantId](CreateInvitationOptions.md#tenantid)
- [ttl](CreateInvitationOptions.md#ttl)

## Properties

### createdBy

• **createdBy**: `Identity`

The identity of the user who is creating the invitation.

#### Defined in

[tenant/src/index.ts:270](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L270)

___

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

The tenant ID the invitation relates to.

#### Defined in

[tenant/src/index.ts:274](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L274)

___

### ttl

• **ttl**: `number`

The time-to-live of the invitation in seconds.

#### Defined in

[tenant/src/index.ts:278](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L278)
