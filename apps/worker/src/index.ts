import { SQSBatchResponse, SQSEvent, SQSHandler } from "aws-lambda";
// Uncomment as necessary to access the DB or the queue:
// import { getItem, putItem, deleteItem, listItems } from "@letsgo/db";
// import { enqueue } from "@letsgo/queue";

export const handler: SQSHandler = async (event: SQSEvent, context) => {
  console.log(
    `Worker received ${event?.Records?.length} message${
      event?.Records?.length === 1 ? "" : "s"
    }`
  );
  const response: SQSBatchResponse = {
    // on success:
    batchItemFailures: [],
    // on error:
    // batchItemFailures: [{ itemIdentifier: event.Records[0].messageId }],
  };
  return response;
};
