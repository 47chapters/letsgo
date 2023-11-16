[@letsgo/types](../README.md) / GetTenantUsersResponse

# Interface: GetTenantUsersResponse

All users with permissions to access a tenant.

## Table of contents

### Properties

- [identities](GetTenantUsersResponse.md#identities)

## Properties

### identities

• **identities**: \{ `identityId`: `string` ; `iss`: `string` ; `sub`: `string` ; `user?`: \{ `[key: string]`: `any`; `email?`: `string` ; `email_verified?`: `boolean` ; `family_name?`: `string` ; `given_name?`: `string` ; `locale?`: `string` ; `name?`: `string` ; `nickname?`: `string` ; `picture?`: `string` ; `sid?`: `string` ; `sub?`: `string`  }  }[]

Array of identities represeting users with access to the tenant.

#### Defined in

[index.ts:17](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L17)
