[@letsgo/trust](../README.md) / PkiIssuer

# Interface: PkiIssuer

Definition of a built-in PKI issuer.

## Hierarchy

- `DBItem`

- [`PkiCredentials`](PkiCredentials.md)

  ↳ **`PkiIssuer`**

## Table of contents

### Properties

- [category](PkiIssuer.md#category)
- [createdAt](PkiIssuer.md#createdat)
- [key](PkiIssuer.md#key)
- [kid](PkiIssuer.md#kid)
- [privateKey](PkiIssuer.md#privatekey)
- [publicKey](PkiIssuer.md#publickey)
- [ttl](PkiIssuer.md#ttl)

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

The time when the PKI credentials was created.

#### Inherited from

[PkiCredentials](PkiCredentials.md).[createdAt](PkiCredentials.md#createdat)

#### Defined in

[trust/src/issuer.ts:50](https://github.com/tjanczuk/letsgo/blob/502ef5a/packages/trust/src/issuer.ts#L50)

___

### key

• **key**: `string`

The DynamoDB sort key.

#### Inherited from

DBItem.key

#### Defined in

db/dist/index.d.ts:53

___

### kid

• **kid**: `string`

OAuth key identifier.

#### Inherited from

[PkiCredentials](PkiCredentials.md).[kid](PkiCredentials.md#kid)

#### Defined in

[trust/src/issuer.ts:46](https://github.com/tjanczuk/letsgo/blob/502ef5a/packages/trust/src/issuer.ts#L46)

___

### privateKey

• **privateKey**: `string`

Private RSA key in PEM format.

#### Inherited from

[PkiCredentials](PkiCredentials.md).[privateKey](PkiCredentials.md#privatekey)

#### Defined in

[trust/src/issuer.ts:42](https://github.com/tjanczuk/letsgo/blob/502ef5a/packages/trust/src/issuer.ts#L42)

___

### publicKey

• **publicKey**: `string`

Public RSA key in PEM format.

#### Inherited from

[PkiCredentials](PkiCredentials.md).[publicKey](PkiCredentials.md#publickey)

#### Defined in

[trust/src/issuer.ts:38](https://github.com/tjanczuk/letsgo/blob/502ef5a/packages/trust/src/issuer.ts#L38)

___

### ttl

• `Optional` **ttl**: `number`

The time-to-live (TTL) value for the item.

#### Inherited from

DBItem.ttl

#### Defined in

db/dist/index.d.ts:57
