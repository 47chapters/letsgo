[@letsgo/db](../README.md) / GetItemOptions

# Interface: GetItemOptions

Options for reading data from the database.

## Hierarchy

- [`DeploymentOptions`](DeploymentOptions.md)

  ↳ **`GetItemOptions`**

  ↳↳ [`ListItemsOptions`](ListItemsOptions.md)

## Table of contents

### Properties

- [consistentRead](GetItemOptions.md#consistentread)
- [deployment](GetItemOptions.md#deployment)
- [region](GetItemOptions.md#region)

## Properties

### consistentRead

• `Optional` **consistentRead**: `boolean`

If true, the read will be strongly consistent read in DynamoDB.

#### Defined in

[index.ts:55](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L55)

___

### deployment

• `Optional` **deployment**: `string`

LetsGo deployment name.

#### Inherited from

[DeploymentOptions](DeploymentOptions.md).[deployment](DeploymentOptions.md#deployment)

#### Defined in

[index.ts:45](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L45)

___

### region

• `Optional` **region**: `string`

AWS region.

#### Inherited from

[DeploymentOptions](DeploymentOptions.md).[region](DeploymentOptions.md#region)

#### Defined in

[index.ts:41](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/db/src/index.ts#L41)
