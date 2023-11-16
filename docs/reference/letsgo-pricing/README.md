@letsgo/pricing

# @letsgo/pricing

This package defines the pricing plans of your app.

## Table of contents

### Interfaces

- [Plan](interfaces/Plan.md)

### Variables

- [ActivePlans](README.md#activeplans)
- [DefaultPlanId](README.md#defaultplanid)
- [Plans](README.md#plans)

### Functions

- [getActivePlan](README.md#getactiveplan)
- [getPlan](README.md#getplan)

## Variables

### ActivePlans

• `Const` **ActivePlans**: [`Plan`](interfaces/Plan.md)[]

The list of active plans only.

#### Defined in

[index.ts:117](https://github.com/tjanczuk/letsgo/blob/054058c/packages/pricing/src/index.ts#L117)

___

### DefaultPlanId

• `Const` **DefaultPlanId**: `string` = `"free"`

The default plan Id to use for all new tenants. This is typically a freemium plan.

#### Defined in

[index.ts:55](https://github.com/tjanczuk/letsgo/blob/054058c/packages/pricing/src/index.ts#L55)

___

### Plans

• `Const` **Plans**: [`Plan`](interfaces/Plan.md)[]

The list of all plans, active and non-active. Never remove a plan from this list that has any active tenants using it,
even if you no longer offer this plan to new users. Mark it as `active: false` instead.

#### Defined in

[index.ts:61](https://github.com/tjanczuk/letsgo/blob/054058c/packages/pricing/src/index.ts#L61)

## Functions

### getActivePlan

▸ **getActivePlan**(`planId`): [`Plan`](interfaces/Plan.md) \| `undefined`

Gets an active plan by Id.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `planId` | `string` | The plan Id |

#### Returns

[`Plan`](interfaces/Plan.md) \| `undefined`

The plan if it exists and is active, undefined otherwise.

#### Defined in

[index.ts:124](https://github.com/tjanczuk/letsgo/blob/054058c/packages/pricing/src/index.ts#L124)

___

### getPlan

▸ **getPlan**(`planId`): [`Plan`](interfaces/Plan.md) \| `undefined`

Gets a plan by Id.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `planId` | `string` | The plan Id |

#### Returns

[`Plan`](interfaces/Plan.md) \| `undefined`

The plan or undefined if it does not exist.

#### Defined in

[index.ts:133](https://github.com/tjanczuk/letsgo/blob/054058c/packages/pricing/src/index.ts#L133)
