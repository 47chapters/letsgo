[@letsgo/pricing](../README.md) / Plan

# Interface: Plan

A pricing plan

## Table of contents

### Properties

- [actionUrl](Plan.md#actionurl)
- [actionVerb](Plan.md#actionverb)
- [active](Plan.md#active)
- [descripton](Plan.md#descripton)
- [features](Plan.md#features)
- [name](Plan.md#name)
- [planId](Plan.md#planid)
- [price](Plan.md#price)
- [usesStripe](Plan.md#usesstripe)

## Properties

### actionUrl

• `Optional` **actionUrl**: `string`

A URL the user should be redirected to if they select this plan. This may be used for custom plans that
require a sales person to contact the user. In that case the the URL maybe a _mailto:_ link or a link
the contact form of the website.

#### Defined in

[index.ts:45](https://github.com/47chapters/letsgo/blob/06da252/packages/pricing/src/index.ts#L45)

___

### actionVerb

• `Optional` **actionVerb**: `string`

The verb to use in the action button for the plan, e.g. "Contact Us" or "Buy Now".

#### Defined in

[index.ts:49](https://github.com/47chapters/letsgo/blob/06da252/packages/pricing/src/index.ts#L49)

___

### active

• **active**: `boolean`

If false, the plan is not available for selection when signing up or switching plans. Set this to false
if you want to discontinue a plan. Never remove a plan that has any active tenants using it.

#### Defined in

[index.ts:19](https://github.com/47chapters/letsgo/blob/06da252/packages/pricing/src/index.ts#L19)

___

### descripton

• **descripton**: `string`

Brief description of the plan.

#### Defined in

[index.ts:27](https://github.com/47chapters/letsgo/blob/06da252/packages/pricing/src/index.ts#L27)

___

### features

• **features**: `string`[]

"Bullet points" list of features of the plan.

#### Defined in

[index.ts:31](https://github.com/47chapters/letsgo/blob/06da252/packages/pricing/src/index.ts#L31)

___

### name

• **name**: `string`

Brief, friendly name of the plan.

#### Defined in

[index.ts:23](https://github.com/47chapters/letsgo/blob/06da252/packages/pricing/src/index.ts#L23)

___

### planId

• **planId**: `string`

Unique identifier of the plan. Never reuse plan Id values.

#### Defined in

[index.ts:14](https://github.com/47chapters/letsgo/blob/06da252/packages/pricing/src/index.ts#L14)

___

### price

• `Optional` **price**: `string`

Textual description of the price of the plan, e.g. "$10 / month"

#### Defined in

[index.ts:39](https://github.com/47chapters/letsgo/blob/06da252/packages/pricing/src/index.ts#L39)

___

### usesStripe

• **usesStripe**: `boolean`

If true, this is a paid plan that should be handled by Stripe subscriptions.

#### Defined in

[index.ts:35](https://github.com/47chapters/letsgo/blob/06da252/packages/pricing/src/index.ts#L35)
