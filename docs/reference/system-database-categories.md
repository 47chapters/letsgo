## System database categories

LetsGo maintains several categories in the [database](../backgound/data-model.md) to support the functionality that comes with the platform. This describes those built-in categories.

### letsgo-tenant

Key: `{tenantId}`

Stores information about a tenant in the system, including the current subscription plan and Stripe subscription information, if any. Tenants that have been logically deleted remain in the database but are marked as deleted.

### letsgo-identity

Key: `{identityId}`

Stores user profile associated with a specific identity (a credential the user used when logging in to the system using Auth0). This profile is used by the UI components of the _web_ responsible for the user management features to display a descriptive name of users in the UI.

### letsgo-tenant-identity

Key: `/{tenantId}/{identityId}`

Represents membership of a user `{identityId}` in tenant `{tenantId}`. This is used by the UI components of the _web_ responsible for the user management features of a tenant.

### letsgo-identity-tenant

Key: `/{identityId}/{tenantId}`

Represents the tenants the user `{identityId}` has permissions to access. This is used to efficiently query which tenants a logged in user has access to and manifests itself in the UI of the _web_ component as a tenant selector drop-down. It is directly used by the `/v1/me` endpoint of the _API_ component to return all tenants the caller of the API has access to.

### letsgo-issuer

Key: `{issuerId}`

Represents a [trusted issuer](../how-to/manage-trust-and-authentication.md) registered in the system.

### letsgo-issuer-active

Key: `/` (a fixed value of a singleton item)

There is only ever up to one such item in the database. It specifies which of the PKI trusted issuers registered in the system is the active issuer.

### letsgo-test

Key: varies

This category is used by LetsGo tests.

### Related topics

[Data model](../backgound/data-model.md)
