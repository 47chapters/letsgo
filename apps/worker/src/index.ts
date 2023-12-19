import { Message } from "@letsgo/types";
import {
  Context,
  EventBridgeEvent,
  Handler,
  SQSBatchResponse,
  SQSEvent,
  SQSRecord,
} from "aws-lambda";
import { handlers, unrecognizedMessageTypeHandler } from "./handlers";
import { scheduledHandler } from "./handlers/scheduledEventHandler";

const processRecord = async (
  record: SQSRecord,
  event: SQSEvent,
  context: Context
) => {
  let message: Message;
  try {
    message = JSON.parse(record.body) as Message;
  } catch (e: any) {
    return new Promise((_, reject) =>
      reject(new Error("Message body cannot be parsed as JSON"))
    );
  }
  const handler = handlers[message.type] || unrecognizedMessageTypeHandler;
  return handler(message, event, context);
};

const sqsHandler = async (
  event: SQSEvent,
  context: Context
): Promise<SQSBatchResponse> => {
  console.log(
    `WORKER RECEIVED ${event?.Records?.length} MESSAGE${
      event?.Records?.length === 1 ? "" : "S"
    }`
  );

  const records = event?.Records || [];
  const results = await Promise.allSettled(
    records.map((record) => processRecord(record, event, context))
  );
  const response: SQSBatchResponse = {
    batchItemFailures: [],
  };
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      response.batchItemFailures.push({
        itemIdentifier: event.Records[index].messageId,
      });
    }
  });

  console.log(
    `WORKER RESPONSE: ${
      event?.Records?.length - response.batchItemFailures.length
    } SUCCESS, ${response.batchItemFailures.length} FAILURE`
  );

  return response;
};

function isScheduledEvent(
  event: any
): event is EventBridgeEvent<"Scheduled Event", any> {
  return event?.["detail-type"] === "Scheduled Event";
}

export const handler: Handler<
  SQSEvent | EventBridgeEvent<"Scheduled Event", any>,
  SQSBatchResponse | void
> = async (event, context): Promise<void | SQSBatchResponse> => {
  if (isScheduledEvent(event)) {
    // This is an event triggered by the EventBridge scheduler
    return scheduledHandler(event, context);
  } else {
    // This is message batch received from SQS
    return sqsHandler(event, context);
  }
};
