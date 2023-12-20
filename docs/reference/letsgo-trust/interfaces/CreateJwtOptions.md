[@letsgo/trust](../README.md) / CreateJwtOptions

# Interface: CreateJwtOptions

Options for creating a JWT access token.

## Table of contents

### Properties

- [audience](CreateJwtOptions.md#audience)
- [expiresIn](CreateJwtOptions.md#expiresin)
- [issuer](CreateJwtOptions.md#issuer)
- [subject](CreateJwtOptions.md#subject)

## Properties

### audience

• `Optional` **audience**: `string`

The `aud` claim of the JWT. If not specified, the value of the `LETSGO_API_AUDIENCE` environment variable will
be used if specified, or `letsgo:service` otherwise.

#### Defined in

[trust/src/jwt.ts:27](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/jwt.ts#L27)

___

### expiresIn

• `Optional` **expiresIn**: `string`

Expiration time of the JWT. If not specified, the default expiry will be used. The value can be a number of seconds,
or an expression like `8h`, `2d`, etc. If `0` is specified, a non-expiring JWT token is issued.

#### Defined in

[trust/src/jwt.ts:32](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/jwt.ts#L32)

___

### issuer

• `Optional` **issuer**: [`PkiIssuer`](PkiIssuer.md)

The built-in PKI issuer to use to sign the JWT. If not specified, the active issuer will be used.

#### Defined in

[trust/src/jwt.ts:18](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/jwt.ts#L18)

___

### subject

• `Optional` **subject**: `string`

The `sub` claim of the JWT. If not specified, the same value as the `iss` claim will be used.

#### Defined in

[trust/src/jwt.ts:22](https://github.com/47chapters/letsgo/blob/5310a6f/packages/trust/src/jwt.ts#L22)
