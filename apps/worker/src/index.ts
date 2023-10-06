import { SQSBatchResponse, SQSEvent, SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event: SQSEvent, context) => {
  console.log(`Worker received ${event.Records.length} messages`);
  const response: SQSBatchResponse = {
    // on success:
    batchItemFailures: [],
    // on error:
    // batchItemFailures: [{ itemIdentifier: event.Records[0].messageId }],
  };
  return response;
};
