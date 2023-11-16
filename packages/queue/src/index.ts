/**
 * This package provides a way to enqueue messages to be processed by the LetsGo _worker_.
 *
 * @module
 */

import {
  ListQueueTagsCommand,
  ListQueuesCommand,
  ListQueuesCommandInput,
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { DefaultRegion, DefaultDeployment, TagKeys } from "@letsgo/constants";
import { Message } from "@letsgo/types";
import http from "http";

const apiVersion = "2012-11-05";

let client: SQSClient | undefined;
/**
 * @ignore
 */
export function getSQSClient(region: string): SQSClient {
  if (!client) {
    client = new SQSClient({
      apiVersion,
      region: DefaultRegion,
    });
  }
  return client;
}

/**
 * Lists all SQS queue URLs created by LetsGo in a given region and optionally to support a given deployment.
 * @param region AWS region
 * @param deployment LetsGo deployment name
 * @returns Array of matching SQS queue URLs
 */
export async function listLetsGoQueues(
  region: string,
  deployment?: string
): Promise<string[]> {
  const sqs = getSQSClient(region);
  const listInput: ListQueuesCommandInput = {};
  const queues: string[] = [];
  while (true) {
    const result = await sqs.send(new ListQueuesCommand(listInput));
    for (const queueUrl of result.QueueUrls || []) {
      const listTagsCommand = new ListQueueTagsCommand({
        QueueUrl: queueUrl,
      });
      try {
        const tagsResult = await sqs.send(listTagsCommand);
        const deploymentValue = tagsResult.Tags?.[TagKeys.LetsGoDeployment];
        if (
          deploymentValue &&
          (!deployment || deployment === deploymentValue)
        ) {
          queues.push(queueUrl);
        }
      } catch (e: any) {
        if (e.name !== "AWS.SimpleQueueService.NonExistentQueue") {
          throw e;
        }
      }
    }
    if (!result.NextToken) {
      break;
    }
    listInput.NextToken = result.NextToken;
  }
  return queues;
}

let queueUrl: string | undefined;
let queueError: Error | undefined;
async function getQueueUrl(): Promise<string> {
  if (!queueUrl) {
    if (queueError) {
      throw queueError;
    }
    const queues = await listLetsGoQueues(DefaultRegion, DefaultDeployment);
    if (queues.length === 0) {
      throw (queueError = new Error(
        `No SQS queue found for deployment ${DefaultDeployment} in region ${DefaultRegion}.`
      ));
    }
    if (queues.length > 1) {
      throw (queueError = new Error(
        `Found ${
          queues.length
        } queues for deployment ${DefaultDeployment} in region ${DefaultRegion} while expecting only one: ${queues.join(
          ", "
        )}`
      ));
    }
    queueUrl = queues[0];
  }
  return queueUrl;
}

/**
 * Options for enqueueing a message.
 */
export interface EnqueueOptions {
  /**
   * The number of seconds to delay the message readiness for delivery to the worker.
   */
  delaySeconds?: number;
}

/**
 * Result of enqueueing a message.
 */
export interface EnqueueResult {
  /**
   * The SQS message ID.
   */
  messageId: string;
}

function getLocalQueueUrl(): string | undefined {
  return process.env.LETSGO_LOCAL_QUEUE_URL || undefined;
}

async function enqueueAWS(
  message: Message,
  options?: EnqueueOptions
): Promise<EnqueueResult> {
  const QueueUrl = await getQueueUrl();
  const sqs = getSQSClient(DefaultRegion);
  const command = new SendMessageCommand({
    QueueUrl,
    DelaySeconds: options?.delaySeconds,
    MessageBody: JSON.stringify(message),
  });
  const result = await sqs.send(command);
  return {
    messageId: result.MessageId || "",
  };
}

const createId = () => Math.random().toString(36).substring(2, 15);

async function enqueueLocal(
  message: Message,
  options?: EnqueueOptions
): Promise<EnqueueResult> {
  const serializedMessage = JSON.stringify(message);
  const sender = `letsgo:local:${process.env.USER || "unknown"}`;
  const payload = {
    Records: [
      {
        messageId: createId(),
        receiptHandle: createId(),
        body: serializedMessage,
        attributes: {
          ApproximateReceiveCount: "1",
          SentTimestamp: Date.now().toString(),
          SenderId: sender,
          ApproximateFirstReceiveTimestamp: Date.now().toString(),
        },
        messageAttributes: {},
        md5OfBody: "{md5}",
        eventSource: "letsgo:local",
        eventSourceARN: sender,
        awsRegion: DefaultRegion,
      },
    ],
  };
  await new Promise((resolve, reject) => {
    const req = http
      .request(getLocalQueueUrl() as string, { method: "POST" }, (res) => {
        if (res.statusCode !== 201) {
          return reject(
            new Error(
              `Unexpected status code ${res.statusCode} from local queue.`
            )
          );
        }
        res.on("data", () => {});
        res.on("end", () => resolve(undefined));
      })
      .end(JSON.stringify(payload));
    req.on("error", reject);
  });
  return { messageId: payload.Records[0].messageId };
}

/**
 * Enqueues a message to be processed by the LetsGo _worker_. If the `LETSGO_LOCAL_QUEUE_URL` environment variable is set,
 * the message is sent to the specified URL with an HTTP POST instead of being enqueued to AWS SQS. This environment variable
 * is used in the local development scenario to allow the _worker_ component to run behind a lightweight HTTP server
 * on the developer's machine.
 * @param message The message to enqueue
 * @param options Options for enqueueing the message
 * @returns Enqeue result, including SQS message Id.
 */
export async function enqueue(
  message: Message,
  options?: EnqueueOptions
): Promise<EnqueueResult> {
  return getLocalQueueUrl()
    ? enqueueLocal(message, options)
    : enqueueAWS(message, options);
}
