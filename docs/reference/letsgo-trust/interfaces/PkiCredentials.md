[@letsgo/trust](../README.md) / PkiCredentials

# Interface: PkiCredentials

PKI credentials of a built-in PKI issuer.

## Hierarchy

- **`PkiCredentials`**

  ↳ [`PkiIssuer`](PkiIssuer.md)

## Table of contents

### Properties

- [createdAt](PkiCredentials.md#createdat)
- [kid](PkiCredentials.md#kid)
- [privateKey](PkiCredentials.md#privatekey)
- [publicKey](PkiCredentials.md#publickey)

## Properties

### createdAt

• **createdAt**: `string`

The time when the PKI credentials was created.

#### Defined in

[trust/src/issuer.ts:50](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/issuer.ts#L50)

___

### kid

• **kid**: `string`

OAuth key identifier.

#### Defined in

[trust/src/issuer.ts:46](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/issuer.ts#L46)

___

### privateKey

• **privateKey**: `string`

Private RSA key in PEM format.

#### Defined in

[trust/src/issuer.ts:42](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/issuer.ts#L42)

___

### publicKey

• **publicKey**: `string`

Public RSA key in PEM format.

#### Defined in

[trust/src/issuer.ts:38](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/issuer.ts#L38)
