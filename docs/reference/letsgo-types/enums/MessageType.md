[@letsgo/types](../README.md) / MessageType

# Enumeration: MessageType

Message types recognized by the _worker_ component.

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

[index.ts:169](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L169)

___

### Stripe

• **Stripe** = ``"letsgo:stripe"``

Stripe webhook event.

#### Defined in

[index.ts:173](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L173)

___

### TenantDeleted

• **TenantDeleted** = ``"letsgo:tenant:deleted"``

LetsGo tenant deleted.

#### Defined in

[index.ts:181](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L181)

___

### TenantNew

• **TenantNew** = ``"letsgo:tenant:new"``

New LetsGo tenant created.

#### Defined in

[index.ts:177](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L177)
