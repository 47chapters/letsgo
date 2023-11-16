[@letsgo/types](../README.md) / MessageType

# Enumeration: MessageType

Message types recognized by the _worker_ component. You should add your own message types here.
Do not use the `letsgo` prefix as it is reserved for future internal LetsGo message types.

## Table of contents

### Enumeration Members

- [Contact](MessageType.md#contact)
- [Stripe](MessageType.md#stripe)
- [TenantDeleted](MessageType.md#tenantdeleted)
- [TenantNew](MessageType.md#tenantnew)

## Enumeration Members

### Contact

• **Contact** = ``"letsgo:contact"``

Submission of the contact form.

#### Defined in

[index.ts:170](https://github.com/tjanczuk/letsgo/blob/4d5649a/packages/types/src/index.ts#L170)

___

### Stripe

• **Stripe** = ``"letsgo:stripe"``

Stripe webhook event.

#### Defined in

[index.ts:174](https://github.com/tjanczuk/letsgo/blob/4d5649a/packages/types/src/index.ts#L174)

___

### TenantDeleted

• **TenantDeleted** = ``"letsgo:tenant:deleted"``

LetsGo tenant deleted.

#### Defined in

[index.ts:182](https://github.com/tjanczuk/letsgo/blob/4d5649a/packages/types/src/index.ts#L182)

___

### TenantNew

• **TenantNew** = ``"letsgo:tenant:new"``

New LetsGo tenant created.

#### Defined in

[index.ts:178](https://github.com/tjanczuk/letsgo/blob/4d5649a/packages/types/src/index.ts#L178)
