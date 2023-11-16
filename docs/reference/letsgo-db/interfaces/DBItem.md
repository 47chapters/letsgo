[@letsgo/db](../README.md) / DBItem

# Interface: DBItem

A database item.

## Indexable

▪ [key: `string`]: `any`

Any other attributes.

## Table of contents

### Properties

- [category](DBItem.md#category)
- [key](DBItem.md#key)
- [ttl](DBItem.md#ttl)

## Properties

### category

• **category**: `string`

The DynamoDB partition key.

#### Defined in

[index.ts:79](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L79)

___

### key

• **key**: `string`

The DynamoDB sort key.

#### Defined in

[index.ts:83](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L83)

___

### ttl

• `Optional` **ttl**: `number`

The time-to-live (TTL) value for the item.

#### Defined in

[index.ts:87](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L87)
