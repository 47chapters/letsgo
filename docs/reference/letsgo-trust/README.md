@letsgo/trust

# @letsgo/trust

This package helps manage trust in LetsGo. It provides functions for managing issuers, identities,
and issuing and verifying JWTs,

## Table of contents

### Interfaces

- [Claims](interfaces/Claims.md)
- [CreateJwtOptions](interfaces/CreateJwtOptions.md)
- [GetIdentityResult](interfaces/GetIdentityResult.md)
- [Identity](interfaces/Identity.md)
- [IdentityOptions](interfaces/IdentityOptions.md)
- [JwksIssuer](interfaces/JwksIssuer.md)
- [ListIssuersResult](interfaces/ListIssuersResult.md)
- [PkiCredentials](interfaces/PkiCredentials.md)
- [PkiIssuer](interfaces/PkiIssuer.md)
- [PutIdentityOptions](interfaces/PutIdentityOptions.md)

### Type Aliases

- [Issuer](README.md#issuer)

### Variables

- [DefaultExpiry](README.md#defaultexpiry)

### Functions

- [addJwksIssuer](README.md#addjwksissuer)
- [createIssuer](README.md#createissuer)
- [createJwt](README.md#createjwt)
- [deleteIdentity](README.md#deleteidentity)
- [deleteIssuer](README.md#deleteissuer)
- [deserializeIdentity](README.md#deserializeidentity)
- [getActiveIssuer](README.md#getactiveissuer)
- [getIdentity](README.md#getidentity)
- [getIssuer](README.md#getissuer)
- [getPkiIss](README.md#getpkiiss)
- [getSignatureVerificationKey](README.md#getsignatureverificationkey)
- [isBuiltInIssuer](README.md#isbuiltinissuer)
- [isJwksIssuer](README.md#isjwksissuer)
- [isPkiIssuer](README.md#ispkiissuer)
- [listIssuers](README.md#listissuers)
- [putIdentity](README.md#putidentity)
- [serializeIdentity](README.md#serializeidentity)
- [setActiveIssuer](README.md#setactiveissuer)
- [verifyJwt](README.md#verifyjwt)

## Type Aliases

### Issuer

Ƭ **Issuer**: [`JwksIssuer`](interfaces/JwksIssuer.md) \| [`PkiIssuer`](interfaces/PkiIssuer.md)

An issuer is either a third-party JWKS-based issuer or a built-in PKI-based issuer.

#### Defined in

[trust/src/issuer.ts:61](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L61)

## Variables

### DefaultExpiry

• `Const` **DefaultExpiry**: ``"8h"``

Default expiry for JWT access tokens created using built-in PKI issuers.

#### Defined in

[trust/src/jwt.ts:9](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/jwt.ts#L9)

## Functions

### addJwksIssuer

▸ **addJwksIssuer**(`issuerId`, `jwks`, `options?`): `Promise`\<`void`\>

Adds a new third party JWKS issuer to the system.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `issuerId` | `string` | The unique identifier of the issuer. |
| `jwks` | `string` | The [JWKS](https://tools.ietf.org/html/rfc7517) URL of the issuer. |
| `options?` | `DeploymentOptions` | Location of the deployment. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[trust/src/issuer.ts:171](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L171)

___

### createIssuer

▸ **createIssuer**(`setActive`, `options?`): `Promise`\<[`PkiIssuer`](interfaces/PkiIssuer.md)\>

Creates and stores a new built-in PKI issuer and optionally sets it as active. A new private/public key pair is created for the
issuer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `setActive` | `boolean` | If true, the new issuer is set as active. |
| `options?` | `DeploymentOptions` | Location of the deployment. |

#### Returns

`Promise`\<[`PkiIssuer`](interfaces/PkiIssuer.md)\>

The new build-in PKI issuer.

#### Defined in

[trust/src/issuer.ts:275](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L275)

___

### createJwt

▸ **createJwt**(`options?`): `Promise`\<`string`\>

Creates a new JWT access token.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`CreateJwtOptions`](interfaces/CreateJwtOptions.md) | Options for creating the JWT. |

#### Returns

`Promise`\<`string`\>

The JWT access token.

#### Defined in

[trust/src/jwt.ts:40](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/jwt.ts#L40)

___

### deleteIdentity

▸ **deleteIdentity**(`options`): `Promise`\<`void`\>

Deletes an identity from the database. Identities are stored in the `letsgo-identity` category.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`IdentityOptions`](interfaces/IdentityOptions.md) | Options for deleting the identity. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[trust/src/identity.ts:104](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/identity.ts#L104)

___

### deleteIssuer

▸ **deleteIssuer**(`iss`, `options?`): `Promise`\<`void`\>

Removes an issuer from the system. Access tokens issued by the issuer will no longer be trusted.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iss` | `string` | Issuer identifier |
| `options?` | `DeploymentOptions` | Location of the deployment. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[trust/src/issuer.ts:248](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L248)

___

### deserializeIdentity

▸ **deserializeIdentity**(`identity`): [`Identity`](interfaces/Identity.md)

Deserializes identity Id into an [Identity](interfaces/Identity.md).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `identity` | `string` | Identity Id |

#### Returns

[`Identity`](interfaces/Identity.md)

Deserialized identity.

#### Defined in

[trust/src/index.ts:45](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/index.ts#L45)

___

### getActiveIssuer

▸ **getActiveIssuer**(`options?`): `Promise`\<[`PkiIssuer`](interfaces/PkiIssuer.md) \| `undefined`\>

Returns the active built-in PKI issuer if one exists.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `DeploymentOptions` | Location of the deployment. |

#### Returns

`Promise`\<[`PkiIssuer`](interfaces/PkiIssuer.md) \| `undefined`\>

Active PKI issuer or undefined if no active PKI issuer exists.

#### Defined in

[trust/src/issuer.ts:192](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L192)

___

### getIdentity

▸ **getIdentity**(`options`): `Promise`\<[`GetIdentityResult`](interfaces/GetIdentityResult.md) \| `undefined`\>

Gets an identity from the database. Identities are stored in the `letsgo-identity` category.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`IdentityOptions`](interfaces/IdentityOptions.md) | Options for getting the identity. |

#### Returns

`Promise`\<[`GetIdentityResult`](interfaces/GetIdentityResult.md) \| `undefined`\>

The identity result or undefined if the identity does not exist.

#### Defined in

[trust/src/identity.ts:88](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/identity.ts#L88)

___

### getIssuer

▸ **getIssuer**(`iss`, `options?`): `Promise`\<[`Issuer`](README.md#issuer) \| `undefined`\>

Gets an issuer if one exists.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iss` | `string` | Issuer identifier |
| `options?` | `DeploymentOptions` | Location of the deployment. |

#### Returns

`Promise`\<[`Issuer`](README.md#issuer) \| `undefined`\>

Issuer or undefined if the issuer does not exist.

#### Defined in

[trust/src/issuer.ts:261](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L261)

___

### getPkiIss

▸ **getPkiIss**(`issuer`): `string`

Generates the `iss` claim value for a PKI issuer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `issuer` | [`PkiCredentials`](interfaces/PkiCredentials.md) | The PKI issuer. |

#### Returns

`string`

The `iss` claim value.

#### Defined in

[trust/src/issuer.ts:105](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L105)

___

### getSignatureVerificationKey

▸ **getSignatureVerificationKey**(`region`, `deployment`, `iss`, `kid`): `Promise`\<`string` \| `undefined`\>

Returns the public key of an issuer that can be used to validate a JWT access token signature. The combination
of `iss` and `kid` uniquely identifies the key. For third-party issuers, the public key is obtained from the
[JWKS](https://tools.ietf.org/html/rfc7517) endpoint. For built-in PKI issuers it is read from the `letsgo-issuer` category in the database.
The public key is cached in memory for up to 5 minutes, so removing an issuer from the system may not take
effect for up to 5 minutes.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region. |
| `deployment` | `string` | LetsGo deployment name. |
| `iss` | `string` | The `iss` claim value from the access token. |
| `kid` | `string` | The `kid` claim value from the access token. |

#### Returns

`Promise`\<`string` \| `undefined`\>

The RSA public key of the issuer in PEM format or undefined if the key cannot be found.

#### Defined in

[trust/src/keyResolver.ts:140](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/keyResolver.ts#L140)

___

### isBuiltInIssuer

▸ **isBuiltInIssuer**(`iss`): `boolean`

Checks if an `iss` claim value represents a built-in PKI issuer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iss` | `string` | The `iss` claim value from an access token. |

#### Returns

`boolean`

True if the `iss` represents a built-in PKI issuer, false otherwise.

#### Defined in

[trust/src/issuer.ts:113](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L113)

___

### isJwksIssuer

▸ **isJwksIssuer**(`issuer`): issuer is JwksIssuer

Checks if an object is a JWKS issuer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `issuer` | `any` | Prospective JWKS issuer. |

#### Returns

issuer is JwksIssuer

True if the object is a JWKS issuer, false otherwise.

#### Defined in

[trust/src/issuer.ts:82](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L82)

___

### isPkiIssuer

▸ **isPkiIssuer**(`issuer`): issuer is PkiIssuer

Checks if an object is a PKI issuer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `issuer` | `any` | Prospective PKI issuer. |

#### Returns

issuer is PkiIssuer

True if the object is a PKI issuer, false otherwise.

#### Defined in

[trust/src/issuer.ts:91](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L91)

___

### listIssuers

▸ **listIssuers**(`options?`): `Promise`\<[`ListIssuersResult`](interfaces/ListIssuersResult.md)\>

Lists issuers in the system. This function is paginated. If the results contains a `nextToken` property, subsequent
page of the results can be fetched by passing the `nextToken` as an option to the next call of this function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `ListItemsOptions` | Options for listing issuers. |

#### Returns

`Promise`\<[`ListIssuersResult`](interfaces/ListIssuersResult.md)\>

The list of issuers and the optional continuation token for paginated results.

#### Defined in

[trust/src/issuer.ts:159](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L159)

___

### putIdentity

▸ **putIdentity**(`options`): `Promise`\<`void`\>

Upserts an identity to the database. Identities are stored in the `letsgo-identity` category.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`PutIdentityOptions`](interfaces/PutIdentityOptions.md) | Options for upserting the identity. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[trust/src/identity.ts:49](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/identity.ts#L49)

___

### serializeIdentity

▸ **serializeIdentity**(`identity`): `string`

Serializes an [Identity](interfaces/Identity.md) into a string `identityId`. `

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `identity` | [`Identity`](interfaces/Identity.md) | The identity to serialize. |

#### Returns

`string`

identity Id

#### Defined in

[trust/src/index.ts:34](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/index.ts#L34)

___

### setActiveIssuer

▸ **setActiveIssuer**(`iss`, `options?`): `Promise`\<[`PkiIssuer`](interfaces/PkiIssuer.md)\>

Sets active built-in PKI issuer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iss` | `string` | Issuer identifier |
| `options?` | `DeploymentOptions` | Location of the deployment. |

#### Returns

`Promise`\<[`PkiIssuer`](interfaces/PkiIssuer.md)\>

The new, active PKI issuer.

#### Defined in

[trust/src/issuer.ts:215](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/issuer.ts#L215)

___

### verifyJwt

▸ **verifyJwt**(`region`, `deployment`, `token`, `audience`): `Promise`\<`Jwt` \| `undefined`\>

Verifies a JWT access token. A valid JWT must be signed by one of the trusted issuers in the system. Public keys
of the issuers used to validate access token signature are cached in memory for up to 5 minutes, so removing
a trusted issuer may take up to 5 minutes to be effective.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `region` | `string` | AWS region. |
| `deployment` | `string` | LetsGo deployment name. |
| `token` | `string` | JWT access token to verify. |
| `audience` | `string` | Expected value of the `aud` claim in the JWT. |

#### Returns

`Promise`\<`Jwt` \| `undefined`\>

Parsed, validated JWT or undefined if the token is invalid.

#### Defined in

[trust/src/jwt.ts:78](https://github.com/47chapters/letsgo/blob/11c7e19/packages/trust/src/jwt.ts#L78)
