import { Message } from "@letsgo/types";
import {
  Context,
  SQSBatchResponse,
  SQSEvent,
  SQSHandler,
  SQSRecord,
} from "aws-lambda";
import { handlers, unrecognizedMessageTypeHandler } from "./handlers";

// Uncomment as necessary to access the DB:
// import { getItem, putItem, deleteItem, listItems } from "@letsgo/db";

// Uncomment to access the queue
// import { enqueue } from "@letsgo/queue";

// Uncomment as necessary to access the API:
// import { getAccessToken } from "./api";

/**
 * Example of calling the API from the worker
 */
// const accessToken = await getAccessToken();
// const url = `${process.env.LETSGO_API_URL}/v1/me`;
// const authorization = `Bearer ${accessToken}`;
// const apiResult = await fetch(url, { headers: { authorization } });
// if (!apiResult.ok) {
//   throw new Error(
//     `API call failed: HTTP ${apiResult.status} ${apiResult.statusText}`
//   );
// }
// const me = await apiResult.json();
// console.log("API call succeeded:", me);

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

export const handler: SQSHandler = async (event: SQSEvent, context) => {
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
