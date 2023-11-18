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

[tenant/src/index.ts:270](https://github.com/47chapters/letsgo/blob/11c7e19/packages/tenant/src/index.ts#L270)

___

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

The tenant ID the invitation relates to.

#### Defined in

[tenant/src/index.ts:274](https://github.com/47chapters/letsgo/blob/11c7e19/packages/tenant/src/index.ts#L274)

___

### ttl

• **ttl**: `number`

The time-to-live of the invitation in seconds.

#### Defined in

[tenant/src/index.ts:278](https://github.com/47chapters/letsgo/blob/11c7e19/packages/tenant/src/index.ts#L278)
