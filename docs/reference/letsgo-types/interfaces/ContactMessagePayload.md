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

[index.ts:205](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L205)

___

### identityId

• `Optional` **identityId**: `string`

Identity Id of the logged in user when the form was submitted.

#### Defined in

[index.ts:231](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L231)

___

### message

• **message**: `string`

Message provided by the sender.

#### Defined in

[index.ts:213](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L213)

___

### name

• **name**: `string`

Name of the sender.

#### Defined in

[index.ts:209](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L209)

___

### query

• **query**: `Object`

Query parameters of the page where the contact form was submitted.

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

[index.ts:221](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L221)

___

### tenantId

• `Optional` **tenantId**: `string`

Current tenant Id if one was present in the context where the contact form was submitted from.

#### Defined in

[index.ts:227](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L227)

___

### timestamp

• **timestamp**: `string`

Timestamp of the submission.

#### Defined in

[index.ts:217](https://github.com/tjanczuk/letsgo/blob/d6c3e04/packages/types/src/index.ts#L217)
