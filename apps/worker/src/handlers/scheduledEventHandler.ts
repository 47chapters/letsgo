import { sendSlackMessage } from "@letsgo/slack";
import { Context, EventBridgeEvent } from "aws-lambda";

export const scheduledHandler = async (
  event: EventBridgeEvent<"Scheduled Event", any>,
  context: Context
): Promise<void> => {
  console.log(
    `WORKER RECEIVED SCHEDULED EVENT ID ${event.id} WITH TIMESTAMP ${event.time}`
  );

  /**
   * TODO: Implement your scheduled event handler here
   */

  // const text = [
  //   `:stopwatch: Scheduled event`,
  //   `*Id:* ${event.id}`,
  //   `*Time:* ${event.time}`,
  // ];

  // await sendSlackMessage(text.join("\n"));
};
