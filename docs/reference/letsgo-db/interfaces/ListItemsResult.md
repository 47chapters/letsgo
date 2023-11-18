[@letsgo/db](../README.md) / ListItemsResult

# Interface: ListItemsResult\<T\>

The result of a list operation.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DBItem`](DBItem.md) |

## Table of contents

### Properties

- [items](ListItemsResult.md#items)
- [nextToken](ListItemsResult.md#nexttoken)

## Properties

### items

• **items**: `T`[]

The list of items matching the query.

#### Defined in

[index.ts:101](https://github.com/47chapters/letsgo/blob/11c7e19/packages/db/src/index.ts#L101)

___

### nextToken

• `Optional` **nextToken**: `string`

Continuation token for paginated results. If present, the client should pass this token
to the next call to using [ListItemsOptions.nextToken](ListItemsOptions.md#nexttoken) to
retrieve the next page of results.

#### Defined in

[index.ts:107](https://github.com/47chapters/letsgo/blob/11c7e19/packages/db/src/index.ts#L107)
