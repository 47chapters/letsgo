import { Context, SQSBatchResponse, SQSEvent, SQSHandler } from "aws-lambda";

// Uncomment as necessary to access the DB:
// import { getItem, putItem, deleteItem, listItems } from "@letsgo/db";

// Uncomment to access the API
import { getAccessToken } from "./api";

// Uncomment to access the queue
// import { enqueue } from "@letsgo/queue";

export const handler: SQSHandler = async (event: SQSEvent, context) => {
  console.log(
    `Worker received ${event?.Records?.length} message${
      event?.Records?.length === 1 ? "" : "s"
    }`
  );

  /**
   * Example of calling the API from the worker
   */
  const accessToken = await getAccessToken();
  const url = `${process.env.LETSGO_API_URL}/v1/me`;
  const authorization = `Bearer ${accessToken}`;
  const apiResult = await fetch(url, { headers: { authorization } });
  if (!apiResult.ok) {
    throw new Error(
      `API call failed: HTTP ${apiResult.status} ${apiResult.statusText}`
    );
  }
  const me = await apiResult.json();
  console.log("API call succeeded:", me);

  const response: SQSBatchResponse = {
    // on success:
    batchItemFailures: [],
    // on error:
    // batchItemFailures: [{ itemIdentifier: event.Records[0].messageId }],
  };
  return response;
};
