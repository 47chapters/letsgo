[@letsgo/db](../README.md) / ListItemsOptions

# Interface: ListItemsOptions

Options for listing data from the database.

## Hierarchy

- [`GetItemOptions`](GetItemOptions.md)

  ↳ **`ListItemsOptions`**

## Table of contents

### Properties

- [consistentRead](ListItemsOptions.md#consistentread)
- [deployment](ListItemsOptions.md#deployment)
- [limit](ListItemsOptions.md#limit)
- [nextToken](ListItemsOptions.md#nexttoken)
- [region](ListItemsOptions.md#region)

## Properties

### consistentRead

• `Optional` **consistentRead**: `boolean`

If true, the read will be strongly consistent read in DynamoDB.

#### Inherited from

[GetItemOptions](GetItemOptions.md).[consistentRead](GetItemOptions.md#consistentread)

#### Defined in

[index.ts:55](https://github.com/tjanczuk/letsgo/blob/dbef5c2/packages/db/src/index.ts#L55)

___

### deployment

• `Optional` **deployment**: `string`

LetsGo deployment name.

#### Inherited from

[GetItemOptions](GetItemOptions.md).[deployment](GetItemOptions.md#deployment)

#### Defined in

[index.ts:45](https://github.com/tjanczuk/letsgo/blob/dbef5c2/packages/db/src/index.ts#L45)

___

### limit

• `Optional` **limit**: `number`

The maximum number of items to return.

#### Defined in

[index.ts:65](https://github.com/tjanczuk/letsgo/blob/dbef5c2/packages/db/src/index.ts#L65)

___

### nextToken

• `Optional` **nextToken**: `string`

Continuation token for paginated results.

#### Defined in

[index.ts:69](https://github.com/tjanczuk/letsgo/blob/dbef5c2/packages/db/src/index.ts#L69)

___

### region

• `Optional` **region**: `string`

AWS region.

#### Inherited from

[GetItemOptions](GetItemOptions.md).[region](GetItemOptions.md#region)

#### Defined in

[index.ts:41](https://github.com/tjanczuk/letsgo/blob/dbef5c2/packages/db/src/index.ts#L41)
