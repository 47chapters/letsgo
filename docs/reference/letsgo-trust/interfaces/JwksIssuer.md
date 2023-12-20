[@letsgo/trust](../README.md) / JwksIssuer

# Interface: JwksIssuer

Definition of a third-party access token issuer.

## Hierarchy

- `DBItem`

  ↳ **`JwksIssuer`**

## Table of contents

### Properties

- [category](JwksIssuer.md#category)
- [createdAt](JwksIssuer.md#createdat)
- [jwks](JwksIssuer.md#jwks)
- [key](JwksIssuer.md#key)
- [ttl](JwksIssuer.md#ttl)

## Properties

### category

• **category**: `string`

The DynamoDB partition key.

#### Inherited from

DBItem.category

#### Defined in

db/dist/index.d.ts:49

___

### createdAt

• **createdAt**: `string`

The time when the issuer was created.

#### Defined in

[trust/src/issuer.ts:28](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/issuer.ts#L28)

___

### jwks

• **jwks**: `string`

The [JWKS](https://tools.ietf.org/html/rfc7517) URL of the issuer.

#### Defined in

[trust/src/issuer.ts:24](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/issuer.ts#L24)

___

### key

• **key**: `string`

The DynamoDB sort key.

#### Inherited from

DBItem.key

#### Defined in

db/dist/index.d.ts:53

___

### ttl

• `Optional` **ttl**: `number`

The time-to-live (TTL) value for the item.

#### Inherited from

DBItem.ttl

#### Defined in

db/dist/index.d.ts:57
