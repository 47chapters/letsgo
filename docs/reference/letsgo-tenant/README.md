@letsgo/tenant

# @letsgo/tenant

The package consolidates functions for managing LetsGo tenants, users,
and users' memberhips in tenants, including invitations. It also support management of
tenant's subscriptions and keeping track of changes in subscription plans.

## Table of contents

### Interfaces

- [AddIdentityToTenantOptions](interfaces/AddIdentityToTenantOptions.md)
- [CreateInvitationOptions](interfaces/CreateInvitationOptions.md)
- [CreateTenantOptions](interfaces/CreateTenantOptions.md)
- [DeleteInvitationOptions](interfaces/DeleteInvitationOptions.md)
- [DeleteTenantOptions](interfaces/DeleteTenantOptions.md)
- [GetIdentitiesOfTenantOptions](interfaces/GetIdentitiesOfTenantOptions.md)
- [GetInvitationOptions](interfaces/GetInvitationOptions.md)
- [GetInvitationsOptions](interfaces/GetInvitationsOptions.md)
- [GetTenantOptions](interfaces/GetTenantOptions.md)
- [GetTenantsOfIdentityOptions](interfaces/GetTenantsOfIdentityOptions.md)
- [Invitation](interfaces/Invitation.md)
- [IsIdentityInTenantOptions](interfaces/IsIdentityInTenantOptions.md)
- [PutTenantOptions](interfaces/PutTenantOptions.md)
- [RemoveIdentityFromTenantOptions](interfaces/RemoveIdentityFromTenantOptions.md)
- [SubscriptionPlan](interfaces/SubscriptionPlan.md)
- [SubscriptionPlanChange](interfaces/SubscriptionPlanChange.md)
- [Tenant](interfaces/Tenant.md)

### Variables

- [IdentityTenantCategory](README.md#identitytenantcategory)
- [InvitationCategory](README.md#invitationcategory)
- [TenantCategory](README.md#tenantcategory)
- [TenantIdentityCategory](README.md#tenantidentitycategory)

### Functions

- [addIdentityToTenant](README.md#addidentitytotenant)
- [createInvitation](README.md#createinvitation)
- [createTenant](README.md#createtenant)
- [deleteInvitation](README.md#deleteinvitation)
- [deleteTenant](README.md#deletetenant)
- [getIdentitiesOfTenant](README.md#getidentitiesoftenant)
- [getInvitation](README.md#getinvitation)
- [getInvitations](README.md#getinvitations)
- [getTenant](README.md#gettenant)
- [getTenantsOfIdentity](README.md#gettenantsofidentity)
- [isIdentityInTenant](README.md#isidentityintenant)
- [putTenant](README.md#puttenant)
- [reconcileSubscriptionStatus](README.md#reconcilesubscriptionstatus)
- [removeIdentityFromTenant](README.md#removeidentityfromtenant)
- [setNewPlan](README.md#setnewplan)

## Variables

### IdentityTenantCategory

• `Const` **IdentityTenantCategory**: ``"letsgo-identity-tenant"``

The _database_ category for items representing a specific tenant's users.

#### Defined in

[tenant/src/index.ts:53](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L53)

___

### InvitationCategory

• `Const` **InvitationCategory**: ``"letsgo-invitation"``

The _database_ category for items representing invitations for a specific tenant.

#### Defined in

[tenant/src/index.ts:58](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L58)

___

### TenantCategory

• `Const` **TenantCategory**: ``"letsgo-tenant"``

The _database_ category for items representing LetsGo tenants.

#### Defined in

[tenant/src/index.ts:43](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L43)

___

### TenantIdentityCategory

• `Const` **TenantIdentityCategory**: ``"letsgo-tenant-identity"``

The _database_ category for items representing a specific user's access to tenants.

#### Defined in

[tenant/src/index.ts:48](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L48)

## Functions

### addIdentityToTenant

▸ **addIdentityToTenant**(`options`): `Promise`\<`void`\>

Adds a new user to a tenant.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`AddIdentityToTenantOptions`](interfaces/AddIdentityToTenantOptions.md) | Options for adding the user. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[tenant/src/index.ts:734](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L734)

___

### createInvitation

▸ **createInvitation**(`options`): `Promise`\<[`Invitation`](interfaces/Invitation.md)\>

Create an invitation to join a tenant.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CreateInvitationOptions`](interfaces/CreateInvitationOptions.md) | Options for creating the invitation. |

#### Returns

`Promise`\<[`Invitation`](interfaces/Invitation.md)\>

New invitation

#### Defined in

[tenant/src/index.ts:333](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L333)

___

### createTenant

▸ **createTenant**(`options`): `Promise`\<[`Tenant`](interfaces/Tenant.md)\>

Creates a new tenant. The new tenant has a unique ID and is associated with the `DefaultPlanId`
subscription plan defined in the @letsgo/pricing package.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`CreateTenantOptions`](interfaces/CreateTenantOptions.md) | Options for creating the tenant. |

#### Returns

`Promise`\<[`Tenant`](interfaces/Tenant.md)\>

The newly created tenant.

#### Defined in

[tenant/src/index.ts:460](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L460)

___

### deleteInvitation

▸ **deleteInvitation**(`options`): `Promise`\<`void`\>

Revoke an inviation to join a tenant.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`DeleteInvitationOptions`](interfaces/DeleteInvitationOptions.md) | Options for deleting the invitation. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[tenant/src/index.ts:398](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L398)

___

### deleteTenant

▸ **deleteTenant**(`options`): `Promise`\<[`Tenant`](interfaces/Tenant.md) \| `undefined`\>

Deletes a tenant. No data is removed from the database, but the tenant is marked as deleted.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`DeleteTenantOptions`](interfaces/DeleteTenantOptions.md) | Options for deleting the tenant. |

#### Returns

`Promise`\<[`Tenant`](interfaces/Tenant.md) \| `undefined`\>

The deleted tenant, or undefined if the tenant was alrady deleted or does not exist.

#### Defined in

[tenant/src/index.ts:591](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L591)

___

### getIdentitiesOfTenant

▸ **getIdentitiesOfTenant**(`options`): `Promise`\<`Identity`[]\>

Get users who are members of a specific tenant.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`GetIdentitiesOfTenantOptions`](interfaces/GetIdentitiesOfTenantOptions.md) | Options for getting the users. |

#### Returns

`Promise`\<`Identity`[]\>

Array of users who are members of the tenant.

#### Defined in

[tenant/src/index.ts:664](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L664)

___

### getInvitation

▸ **getInvitation**(`options`): `Promise`\<[`Invitation`](interfaces/Invitation.md) \| `undefined`\>

Gets an existing invitation to join a tenant.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`GetInvitationOptions`](interfaces/GetInvitationOptions.md) | Options for getting the invitation. |

#### Returns

`Promise`\<[`Invitation`](interfaces/Invitation.md) \| `undefined`\>

The invitation if it exists and has not expired, undefined otherwise.

#### Defined in

[tenant/src/index.ts:369](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L369)

___

### getInvitations

▸ **getInvitations**(`options`): `Promise`\<[`Invitation`](interfaces/Invitation.md)[]\>

Returns all active, non-expired invitations for a given tenant.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`GetInvitationsOptions`](interfaces/GetInvitationsOptions.md) | Options for getting the invitations. |

#### Returns

`Promise`\<[`Invitation`](interfaces/Invitation.md)[]\>

Array of active invitations.

#### Defined in

[tenant/src/index.ts:423](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L423)

___

### getTenant

▸ **getTenant**(`options`): `Promise`\<[`Tenant`](interfaces/Tenant.md) \| `undefined`\>

Get an existing tenant. If the tenant is deleted, it is returned only if `options.includeDeleted` is true.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`GetTenantOptions`](interfaces/GetTenantOptions.md) | Options for getting the tenant. |

#### Returns

`Promise`\<[`Tenant`](interfaces/Tenant.md) \| `undefined`\>

The tenant if it exists and is not deleted, undefined otherwise.

#### Defined in

[tenant/src/index.ts:516](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L516)

___

### getTenantsOfIdentity

▸ **getTenantsOfIdentity**(`options`): `Promise`\<[`Tenant`](interfaces/Tenant.md)[]\>

Get tenants a specific user has access to.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`GetTenantsOfIdentityOptions`](interfaces/GetTenantsOfIdentityOptions.md) | Options for getting the tenants. |

#### Returns

`Promise`\<[`Tenant`](interfaces/Tenant.md)[]\>

Array of tenants the user has access to.

#### Defined in

[tenant/src/index.ts:626](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L626)

___

### isIdentityInTenant

▸ **isIdentityInTenant**(`options`): `Promise`\<`boolean`\>

Checks if a user is a member of a tenant.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`IsIdentityInTenantOptions`](interfaces/IsIdentityInTenantOptions.md) | Options for checking the membership. |

#### Returns

`Promise`\<`boolean`\>

True if the user is member of the tenant, false otherwise.

#### Defined in

[tenant/src/index.ts:705](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L705)

___

### putTenant

▸ **putTenant**(`options`): `Promise`\<[`Tenant`](interfaces/Tenant.md)\>

Update a tenant.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`PutTenantOptions`](interfaces/PutTenantOptions.md) | Options for updating the tenant. |

#### Returns

`Promise`\<[`Tenant`](interfaces/Tenant.md)\>

The updated tenant.

#### Defined in

[tenant/src/index.ts:556](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L556)

___

### reconcileSubscriptionStatus

▸ **reconcileSubscriptionStatus**(`tenant`, `identity`): `Promise`\<[`Tenant`](interfaces/Tenant.md) \| `undefined`\>

Update the status of the Stripe subscription for a LetsGo tenant based on the source of truth in Stripe.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tenant` | [`Tenant`](interfaces/Tenant.md) | LetsGo tenant to update the subscription status for. |
| `identity` | `Identity` | The idenantity of the user who triggered the update. |

#### Returns

`Promise`\<[`Tenant`](interfaces/Tenant.md) \| `undefined`\>

The updated tenant if the subscription status changed, undefined if there were no changes in status.

#### Defined in

[tenant/src/index.ts:287](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L287)

___

### removeIdentityFromTenant

▸ **removeIdentityFromTenant**(`options`): `Promise`\<`void`\>

Removes a user from a tenant.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`RemoveIdentityFromTenantOptions`](interfaces/RemoveIdentityFromTenantOptions.md) | Options for removing the user. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[tenant/src/index.ts:763](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L763)

___

### setNewPlan

▸ **setNewPlan**(`tenant`, `planId`, `identity`): `void`

Update the tenant with a new plan ID and record the change.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tenant` | [`Tenant`](interfaces/Tenant.md) | The tenant to update. |
| `planId` | `string` | The new plan ID. |
| `identity` | `Identity` | The identity of the user who made the change. |

#### Returns

`void`

#### Defined in

[tenant/src/index.ts:254](https://github.com/tjanczuk/letsgo/blob/f8169ee/packages/tenant/src/index.ts#L254)
