import {
  ListQueueTagsCommand,
  ListQueuesCommand,
  ListQueuesCommandInput,
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { DefaultRegion, DefaultDeployment, TagKeys } from "@letsgo/constants";
import http from "http";

const apiVersion = "2012-11-05";

let client: SQSClient | undefined;
export function getSQSClient(region: string): SQSClient {
  if (!client) {
    client = new SQSClient({
      apiVersion,
      region: DefaultRegion,
    });
  }
  return client;
}

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

export interface EnqueueOptions {
  delaySeconds?: number;
}

export interface EnqueueResult {
  messageId: string;
}

function getLocalQueueUrl(): string | undefined {
  return process.env.LETSGO_LOCAL_QUEUE_URL || undefined;
}

async function enqueueAWS(
  message: any,
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
  message: any,
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
  http
    .request(getLocalQueueUrl() as string, { method: "POST" })
    .end(JSON.stringify(payload));
  return { messageId: payload.Records[0].messageId };
}

export async function enqueue(
  message: any,
  options?: EnqueueOptions
): Promise<EnqueueResult> {
  return getLocalQueueUrl()
    ? enqueueLocal(message, options)
    : enqueueAWS(message, options);
}
