export interface SlackMessage {
  text: string;
  blocks?: any[];
  [key: string]: any;
}

export interface SlackMessageOptions {
  slackUrl?: string;
}

export async function sendSlackMessage(
  message: SlackMessage | string,
  options?: SlackMessageOptions
) {
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
