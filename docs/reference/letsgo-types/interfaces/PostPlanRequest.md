[@letsgo/types](../README.md) / PostPlanRequest

# Interface: PostPlanRequest

Request to switch a teant to a new plan.

## Table of contents

### Properties

- [email](PostPlanRequest.md#email)
- [name](PostPlanRequest.md#name)
- [planId](PostPlanRequest.md#planid)

## Properties

### email

• `Optional` **email**: `string`

If a new Stripe customer needs to be created, this is their email address.

#### Defined in

[index.ts:126](https://github.com/47chapters/letsgo/blob/06da252/packages/types/src/index.ts#L126)

___

### name

• `Optional` **name**: `string`

If a new Stripe customer needs to be created, this is their name.

#### Defined in

[index.ts:130](https://github.com/47chapters/letsgo/blob/06da252/packages/types/src/index.ts#L130)

___

### planId

• **planId**: `string`

The ID of the plan to switch the tenant to.

#### Defined in

[index.ts:122](https://github.com/47chapters/letsgo/blob/06da252/packages/types/src/index.ts#L122)
