[@letsgo/types](../README.md) / GetMeResponse

# Interface: GetMeResponse

Details of the user represented by an access token. This includes the identity of the user as well
as the list of tenants that user has access to.

## Table of contents

### Properties

- [accessToken](GetMeResponse.md#accesstoken)
- [identity](GetMeResponse.md#identity)
- [identityId](GetMeResponse.md#identityid)
- [tenants](GetMeResponse.md#tenants)

## Properties

### accessToken

• `Optional` **accessToken**: `string`

The JWT access token of the user. This is only returned if the `returnAccessToken` query parameter is set.

#### Defined in

[index.ts:108](https://github.com/47chapters/letsgo/blob/06da252/packages/types/src/index.ts#L108)

___

### identity

• **identity**: `Identity`

Deserialized identity of the user.

#### Defined in

[index.ts:104](https://github.com/47chapters/letsgo/blob/06da252/packages/types/src/index.ts#L104)

___

### identityId

• **identityId**: `string`

Serialized identityId of the user.

#### Defined in

[index.ts:100](https://github.com/47chapters/letsgo/blob/06da252/packages/types/src/index.ts#L100)

___

### tenants

• **tenants**: `Tenant`[]

#### Defined in

[index.ts:112](https://github.com/47chapters/letsgo/blob/06da252/packages/types/src/index.ts#L112)
