[@letsgo/types](../README.md) / ContactMessagePayload

# Interface: ContactMessagePayload

Payload of a message of [MessageType.Contact](../enums/MessageType.md#contact) type representing the contact form submission.

## Table of contents

### Properties

- [email](ContactMessagePayload.md#email)
- [identityId](ContactMessagePayload.md#identityid)
- [message](ContactMessagePayload.md#message)
- [name](ContactMessagePayload.md#name)
- [query](ContactMessagePayload.md#query)
- [tenantId](ContactMessagePayload.md#tenantid)
- [timestamp](ContactMessagePayload.md#timestamp)

## Properties

### email

• **email**: `string`

Email address of the sender.

#### Defined in

[index.ts:206](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L206)

___

### identityId

• `Optional` **identityId**: `string`

Identity Id of the logged in user when the form was submitted.

#### Defined in

[index.ts:232](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L232)

___

### message

• **message**: `string`

Message provided by the sender.

#### Defined in

[index.ts:214](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L214)

___

### name

• **name**: `string`

Name of the sender.

#### Defined in

[index.ts:210](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L210)

___

### query

• **query**: `Object`

Query parameters of the page where the contact form was submitted.

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

[index.ts:222](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L222)

___

### tenantId

• `Optional` **tenantId**: `string`

Current tenant Id if one was present in the context where the contact form was submitted from.

#### Defined in

[index.ts:228](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L228)

___

### timestamp

• **timestamp**: `string`

Timestamp of the submission.

#### Defined in

[index.ts:218](https://github.com/47chapters/letsgo/blob/11c7e19/packages/types/src/index.ts#L218)
