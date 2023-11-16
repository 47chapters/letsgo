@letsgo/slack

# @letsgo/slack

This package facilitates sending notifications to Slack using Slack incoming webhooks. This functionality is
primarily used by the LetsGo _worker_ to send notifications about the status of the jobs it is processing.

## Table of contents

### Interfaces

- [SlackMessage](interfaces/SlackMessage.md)
- [SlackMessageOptions](interfaces/SlackMessageOptions.md)

### Functions

- [sendSlackMessage](README.md#sendslackmessage)

## Functions

### sendSlackMessage

▸ **sendSlackMessage**(`message`, `options?`): `Promise`\<`void`\>

Sends a message to Slack. If the `options.slackUrl` parameter is not specified and the `LETSGO_SLACK_URL` environment
variable is not set, the message is not sent, and the function returns immediately.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` \| [`SlackMessage`](interfaces/SlackMessage.md) | The message to send to Slack |
| `options?` | [`SlackMessageOptions`](interfaces/SlackMessageOptions.md) | Options for sending the message |

#### Returns

`Promise`\<`void`\>

#### Defined in

[index.ts:43](https://github.com/tjanczuk/letsgo/blob/c32fd97/packages/slack/src/index.ts#L43)
