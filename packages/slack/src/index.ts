/**
 * The package facilitates sending notifications to Slack using Slack incoming webhooks. This functionality is
 * primarily used by the LetsGo _worker_ to send notifications about the status of the jobs it is processing.
 *
 * @module
 */

/**
 * Slack message to send.
 */
export interface SlackMessage {
  /**
   * The text of the message, including any formatting supported by Slack.
   */
  text: string;
  /**
   * Slack blocks. See [Block Kit](https://api.slack.com/reference/block-kit/blocks) for more information.
   */
  blocks?: any[];
  /**
   * Any other properties to be included in the message, see [Slack message API](https://api.slack.com/messaging/composing).
   */
  [key: string]: any;
}

/**
 * Options for sending a Slack message.
 */
export interface SlackMessageOptions {
  /**
   * The Slack incoming webhook URL. If not specified, the value of the `LETSGO_SLACK_URL` environment
   * variable will be used.
   */
  slackUrl?: string;
}

/**
 * Sends a message to Slack. If the `options.slackUrl` parameter is not specified and the `LETSGO_SLACK_URL` environment
 * variable is not set, the message is not sent, and the function returns immediately.
 * @param message The message to send to Slack
 * @param options Options for sending the message
 */
export async function sendSlackMessage(
  message: SlackMessage | string,
  options?: SlackMessageOptions
): Promise<void> {
  const slackUrl = options?.slackUrl || process.env["LETSGO_SLACK_URL"];
  if (!slackUrl) {
    return;
  }
  if (typeof message === "string") {
    message = { text: message };
  }
  const response = await fetch(slackUrl, {
    method: "POST",
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    let details: string | undefined = undefined;
    let detailsJson: any = undefined;
    try {
      details = await response.text();
      detailsJson = JSON.parse(details);
    } catch (e) {}
    const error: any = new Error(
      `Error sending message to Slack with HTTP POST ${slackUrl}: HTTP ${
        response.status
      } ${response.statusText}${details ? `. Details: ${details}` : ""}`
    );
    error.details = details;
    error.detailsJson = detailsJson;
    throw error;
  }
}
