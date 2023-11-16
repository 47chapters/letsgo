@letsgo/db

# @letsgo/db

This package facilitates access to the LetsGo database. It provides a simple set of CRUD operations
as well as a simple query interface.

## Table of contents

### Interfaces

- [DBItem](interfaces/DBItem.md)
- [DeploymentOptions](interfaces/DeploymentOptions.md)
- [GetItemOptions](interfaces/GetItemOptions.md)
- [ListItemsOptions](interfaces/ListItemsOptions.md)
- [ListItemsResult](interfaces/ListItemsResult.md)

### Functions

- [deleteItem](README.md#deleteitem)
- [getItem](README.md#getitem)
- [listItems](README.md#listitems)
- [putItem](README.md#putitem)

## Functions

### deleteItem

▸ **deleteItem**(`category`, `key`, `options?`): `Promise`\<`void`\>

Ensures the item is deleted. If the item does not exist, this operation is a no-op.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `category` | `string` | The partition key |
| `key` | `string` | The sort key |
| `options?` | [`DeploymentOptions`](interfaces/DeploymentOptions.md) | Options for the operation |

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.ts:180](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L180)

___

### getItem

▸ **getItem**\<`T`\>(`category`, `key`, `options?`): `Promise`\<`T` \| `undefined`\>

Retrieves a single item from the database.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DBItem`](interfaces/DBItem.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `category` | `string` | The partition key |
| `key` | `string` | The sort key |
| `options?` | [`GetItemOptions`](interfaces/GetItemOptions.md) | Options for the operation |

#### Returns

`Promise`\<`T` \| `undefined`\>

A promise that resolves to the item or undefined if the item does not exist or has expired.

#### Defined in

[index.ts:135](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L135)

___

### listItems

▸ **listItems**\<`T`\>(`category`, `keyPrefix`, `options?`): `Promise`\<[`ListItemsResult`](interfaces/ListItemsResult.md)\<`T`\>\>

Lists items in the database that match the given category and key prefix. This function suports pagination.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DBItem`](interfaces/DBItem.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `category` | `string` | The partition key |
| `keyPrefix` | `string` | The prefix of the sort key |
| `options?` | [`ListItemsOptions`](interfaces/ListItemsOptions.md) | Options for the operation |

#### Returns

`Promise`\<[`ListItemsResult`](interfaces/ListItemsResult.md)\<`T`\>\>

Matching items an an optional continuation token for paginated results.

#### Defined in

[index.ts:201](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L201)

___

### putItem

▸ **putItem**\<`T`\>(`item`, `options?`): `Promise`\<`void`\>

Upserts an item in the database.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DBItem`](interfaces/DBItem.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `item` | `T` | The item to upsert |
| `options?` | [`DeploymentOptions`](interfaces/DeploymentOptions.md) | Options for the operation |

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.ts:161](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L161)
