import {
  SQSClient,
  CreateQueueCommand,
  ListQueueTagsCommand,
  ListQueuesCommand,
  ListQueuesCommandInput,
  GetQueueAttributesCommand,
  TagQueueCommand,
  SetQueueAttributesCommand,
  DeleteQueueCommand,
} from "@aws-sdk/client-sqs";
import { Logger } from "../commands/defaults";
import { WorkerSettings } from "../vendor";
import { TagKeys, getTagsAsObject } from "./defaults";
import chalk from "chalk";
import { LetsGoDeploymentConfig } from "./ssm";

const apiVersion = "2012-11-05";

function getSQSClient(region: string) {
  return new SQSClient({
    apiVersion,
    region,
  });
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
      const tagsResult = await sqs.send(listTagsCommand);
      const deploymentValue = tagsResult.Tags?.[TagKeys.LetsGoDeployment];
      if (deploymentValue && (!deployment || deployment === deploymentValue)) {
        queues.push(queueUrl);
      }
    }
    if (!result.NextToken) {
      break;
    }
    listInput.NextToken = result.NextToken;
  }
  return queues;
}

async function getOneLetsGoQueue(
  region: string,
  deployment: string,
  logger: Logger
): Promise<string | undefined> {
  logger(`discovering queues...`, "aws:sqs");
  let existingQueues = await listLetsGoQueues(region, deployment);
  if (existingQueues.length > 1) {
    logger(
      chalk.red(`found multiple matching queues, and expected only one:`),
      "aws:sqs"
    );
    existingQueues.forEach((queueUrl) =>
      logger(chalk.red(`  ${queueUrl}`), "aws:sqs")
    );
    logger(
      chalk.red(
        `manually resolve this issue by deleting the queues you don't need in AWS, then try again`
      ),
      "aws:sqs"
    );
    process.exit(1);
  }
  if (existingQueues.length === 0) {
    logger(`no queues found`, "aws:sqs");
    return undefined;
  }
  logger(`found queue ${existingQueues[0]}`, "aws:sqs");
  return existingQueues[0];
}

async function describeQueue(
  region: string,
  queueUrl: string
): Promise<{ [key: string]: string }> {
  const sqs = getSQSClient(region);
  const getAttributesCommand = new GetQueueAttributesCommand({
    QueueUrl: queueUrl,
    AttributeNames: ["All"],
  });
  const result = await sqs.send(getAttributesCommand);
  return result.Attributes || {};
}

function getRandomSuffix(): string {
  return `${
    10000 * Math.floor(Math.random() * 9 + 1) +
    Math.floor(Math.random() * 10000)
  }`;
}

function getQueueuAttributes(
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig
): { [key: string]: string } {
  return {
    VisibilityTimeout: config[settings.defaultConfig.visibilityTimeout[0]],
    MessageRetentionPeriod:
      config[settings.defaultConfig.messageRetentionPeriod[0]],
    ReceiveMessageWaitTimeSeconds:
      config[settings.defaultConfig.receiveMessageWaitTimeSeconds[0]],
  };
}

export async function createQueue(
  region: string,
  deployment: string,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  logger: Logger
): Promise<string> {
  const sqs = getSQSClient(region);
  // Queues cannot be recreated immediately after deletion. To enable rapid stack
  // removal and recreation, we generate a random queue name suffix.
  const QueueName = `${settings.getQueueNamePrefix(
    deployment
  )}-${getRandomSuffix()}`;
  logger(`creating queue ${QueueName}...`, "aws:sqs");
  const createCommand = new CreateQueueCommand({
    QueueName,
    Attributes: getQueueuAttributes(settings, config),
  });
  const createResult = await sqs.send(createCommand);
  const tagCommand = new TagQueueCommand({
    QueueUrl: createResult.QueueUrl || "",
    Tags: getTagsAsObject(region, deployment),
  });
  await sqs.send(tagCommand);
  return createResult.QueueUrl || "";
}

export async function updateQueue(
  region: string,
  deployment: string,
  queueUrl: string,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  logger: Logger
): Promise<void> {
  const sqs = getSQSClient(region);
  logger(`updating queue ${queueUrl}...`, "aws:sqs");
  // Check if config need to be updated
  const existingAttributes = await describeQueue(region, queueUrl);
  const desiredAttrbutes = getQueueuAttributes(settings, config);
  const needsUpdate = Object.keys(desiredAttrbutes).filter(
    (key) => existingAttributes[key] !== desiredAttrbutes[key]
  );
  if (needsUpdate.length > 0) {
    logger(`updating queue attributes ${needsUpdate.join(", ")}...`, "aws:sqs");
    const updateCommand = new SetQueueAttributesCommand({
      QueueUrl: queueUrl,
      Attributes: desiredAttrbutes,
    });
    await sqs.send(updateCommand);
    const tagCommand = new TagQueueCommand({
      QueueUrl: queueUrl,
      Tags: getTagsAsObject(region, deployment),
    });
    await sqs.send(tagCommand);
  }
  logger(`queue is up to date`, "aws:sqs");
}

export async function ensureQueue(
  region: string,
  deployment: string,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  logger: Logger
): Promise<string> {
  const queueUrl = await getOneLetsGoQueue(region, deployment, logger);
  if (queueUrl) {
    await updateQueue(region, deployment, queueUrl, settings, config, logger);
    return queueUrl;
  } else {
    return await createQueue(region, deployment, settings, config, logger);
  }
}

export async function deleteQueue(
  region: string,
  deployment: string,
  logger: Logger
) {
  const queueUrl = await getOneLetsGoQueue(region, deployment, logger);
  if (!queueUrl) {
    return;
  }
  logger(`deleting queue ${queueUrl}...`, "aws:sqs");
  const sqs = getSQSClient(region);
  const deleteCommand = new DeleteQueueCommand({
    QueueUrl: queueUrl,
  });
  await sqs.send(deleteCommand);
  logger(`queue ${queueUrl} deleted`, "aws:sqs");
}
