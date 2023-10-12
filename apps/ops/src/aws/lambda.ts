import {
  LambdaClient,
  CreateFunctionCommand,
  GetFunctionCommand,
  GetFunctionCommandOutput,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  TagResourceCommand,
  DeleteFunctionCommand,
  CreateEventSourceMappingCommand,
  ListEventSourceMappingsCommand,
  EventSourceMappingConfiguration,
  CreateEventSourceMappingCommandOutput,
  UpdateEventSourceMappingCommand,
  GetEventSourceMappingCommand,
} from "@aws-sdk/client-lambda";
import { Logger } from "../commands/defaults";
import { WorkerSettings } from "@letsgo/constants";
import { LetsGoDeploymentConfig } from "./ssm";
import { getRoleArn } from "./iam";
import { getEcrRepositoryArn } from "./ecr";
import { getOneLetsGoQueue, getQueueArnFromQueueUrl } from "./sqs";
import { getTagsAsObject } from "./defaults";
import chalk from "chalk";
import { get } from "http";

const MaxFunctionWaitTime = 60 * 5; // 5 minutes
const MaxEventSourceMappingWaitTime = 60 * 5; // 5 minutes
const apiVersion = "2015-03-31";

function getLambdaClient(region: string) {
  return new LambdaClient({
    apiVersion,
    region,
  });
}

async function waitForLambda(
  region: string,
  functionName: string,
  maxWait: number,
  isCreating: boolean,
  logger: Logger
): Promise<GetFunctionCommandOutput | undefined> {
  let clock = 0;
  let delay = 1;
  while (true) {
    const result = await getLambda(region, functionName);
    const state = result?.Configuration?.State;
    logger(`${clock}s function state: ${state}`);
    if (state === "Active") {
      return result;
    } else if (state !== "Pending") {
      logger(
        chalk.red(
          `failure ${
            isCreating ? "creating" : "updating"
          } ${functionName} function: unexpected function state ${state}`
        ),
        "aws:lambda"
      );
      process.exit(1);
    }
    if (clock >= maxWait) {
      return undefined;
    }
    if (clock > 60) {
      delay = 10;
    } else if (clock > 20) {
      delay = 5;
    } else if (clock > 5) {
      delay = 2;
    }
    clock += delay;
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  }
}

export async function enableOrDisableEventSourceMapping(
  region: string,
  deployment: string,
  functionName: string,
  start: boolean,
  logger: Logger
) {
  logger(`${start ? "starting" : "stopping"} worker...`, "aws:lambda");
  const queueUrl = await getOneLetsGoQueue(region, deployment, logger);
  if (!queueUrl) {
    logger(
      chalk.yellow(
        `cannot ${start ? "start" : "stop"} worker: queue not found`
      ),
      "aws:sqs"
    );
    return;
  }
  const queueArn = await getQueueArnFromQueueUrl(region, queueUrl || "");
  const eventSource = await getEventSourceMapping(
    region,
    functionName,
    queueArn,
    logger
  );
  if (eventSource) {
    const expectedState = start ? "Disabled" : "Enabled";
    const desiredState = start ? "Enabled" : "Disabled";
    if (eventSource.State !== desiredState) {
      if (eventSource.State !== expectedState) {
        logger(
          chalk.red(
            `event source mapping is in an unexpected state '${eventSource.State}' (expected '${expectedState}')`
          ),
          "aws:lambda"
        );
        process.exit(1);
      }
      const updateCommand = new UpdateEventSourceMappingCommand({
        UUID: eventSource.UUID || "",
        Enabled: start,
      });
      const result = await getLambdaClient(region).send(updateCommand);
      await waitForEventSourceMapping(
        region,
        eventSource.UUID || "",
        MaxEventSourceMappingWaitTime,
        start ? "Enabling" : "Disabling",
        desiredState,
        logger
      );
    }
    logger(`worker ${start ? "started" : "stopped"}`, "aws:lambda");
  } else {
    logger(
      chalk.yellow(
        `cannot ${
          start ? "start" : "stop"
        } worker: event source mapping not found'`
      ),
      "aws:lambda"
    );
  }
}

async function getEventSourceMappingFromUuid(region: string, uuid: string) {
  const lambda = getLambdaClient(region);
  const getEventSourceMappingCommand = new GetEventSourceMappingCommand({
    UUID: uuid,
  });
  try {
    const result = await lambda.send(getEventSourceMappingCommand);
    return result;
  } catch (e: any) {
    if (e.name !== "ResourceNotFoundException") {
      throw e;
    }
    return undefined;
  }
}

async function waitForEventSourceMapping(
  region: string,
  uuid: string,
  maxWait: number,
  inProgressState: string,
  terminalState: string | undefined,
  logger: Logger
): Promise<GetFunctionCommandOutput | undefined> {
  let clock = 0;
  let delay = 1;
  while (true) {
    const result = await getEventSourceMappingFromUuid(region, uuid);
    if (!result) {
      if (inProgressState === "Deleting") {
        return undefined;
      } else {
        logger(
          chalk.red(`cannot find event source mapping with UUID ${uuid}`),
          "aws:lambda"
        );
        process.exit(1);
      }
    }
    const state = result?.State || "Unknown";
    logger(`${clock}s event source mapping state: ${state}`, "aws:lambda");
    if (state === terminalState) {
      return result;
    }
    if (state !== inProgressState) {
      logger(
        chalk.red(
          `unexpected event source mapping state ${state} (expected ${inProgressState})`
        ),
        "aws:lambda"
      );
      process.exit(1);
    }
    if (clock >= maxWait) {
      return terminalState ? undefined : result;
    }
    if (clock > 60) {
      delay = 10;
    } else if (clock > 20) {
      delay = 5;
    } else if (clock > 5) {
      delay = 2;
    }
    clock += delay;
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  }
}

export async function listEventSourceMappings(
  region: string,
  functionName: string,
  queueArn: string
): Promise<EventSourceMappingConfiguration[]> {
  const lambda = getLambdaClient(region);
  const listSourcesCommand = new ListEventSourceMappingsCommand({
    FunctionName: functionName,
    EventSourceArn: queueArn,
  });
  const listResult = await lambda.send(listSourcesCommand);
  return listResult.EventSourceMappings || [];
}

export async function getEventSourceMapping(
  region: string,
  functionName: string,
  queueArn: string,
  logger: Logger
): Promise<EventSourceMappingConfiguration | undefined> {
  const listResult = await listEventSourceMappings(
    region,
    functionName,
    queueArn
  );
  if (!listResult.length) {
    return undefined;
  }
  if (listResult.length > 1) {
    logger(
      chalk.red(
        `found multiple event source mappings from queue ${queueArn} to function ${functionName} and expected exactly one`
      ),
      "aws:lambda"
    );
    process.exit(1);
  }
  return listResult[0];
}

async function createEventSourceMapping(
  region: string,
  functionName: string,
  queueArn: string,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  logger: Logger
): Promise<CreateEventSourceMappingCommandOutput> {
  const lambda = getLambdaClient(region);
  const createEventSourceMappingCommand = new CreateEventSourceMappingCommand({
    FunctionName: functionName,
    EventSourceArn: queueArn,
    BatchSize: +config[settings.defaultConfig.batchSize[0]],
    MaximumBatchingWindowInSeconds:
      +config[settings.defaultConfig.batchingWindow[0]],
    ScalingConfig: {
      MaximumConcurrency: +config[settings.defaultConfig.concurrency[0]],
    },
    Enabled: true,
  });
  const result = await lambda.send(createEventSourceMappingCommand);
  const waitResult = await waitForEventSourceMapping(
    region,
    result.UUID || "",
    MaxEventSourceMappingWaitTime,
    "Creating",
    "Enabled",
    logger
  );
  if (!waitResult) {
    logger(
      chalk.red(
        `event source mapping was created but did not reach Enabled state within ${MaxEventSourceMappingWaitTime} seconds`
      )
    );
    logger(
      chalk.red(
        `rerun the command to ensure the event source mapping is up to date or check the status in AWS`
      )
    );
    process.exit(1);
  }

  return result;
}

export async function createLambda(
  region: string,
  deployment: string,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  imageTag: string,
  logger: Logger
): Promise<void> {
  const FunctionName = settings.getLambdaFunctionName(deployment);
  logger(`creating worker...`, "aws:lambda");
  const lambda = getLambdaClient(region);
  const roleName = settings.getRoleName(region, deployment);
  const roleArn = await getRoleArn(roleName);
  const ecrRepositoryName = settings.getEcrRepositoryName(deployment);
  const ecrRepositoryArn = await getEcrRepositoryArn(region, ecrRepositoryName);
  const ImageUri = `${ecrRepositoryArn}:${imageTag}`;
  // Create Lambda function
  const createCommand = new CreateFunctionCommand({
    FunctionName,
    Role: roleArn,
    Code: {
      ImageUri,
    },
    PackageType: "Image",
    Timeout: +config[settings.defaultConfig.functionTimeout[0]],
    MemorySize: +config[settings.defaultConfig.functionMemory[0]],
    Environment: {
      Variables: {
        LETSGO_DEPLOYMENT: deployment,
        ...config,
      },
    },
    Tags: getTagsAsObject(region, deployment),
    EphemeralStorage: {
      Size: +config[settings.defaultConfig.functionEphemeralStorage[0]],
    },
  });
  const createResult = await lambda.send(createCommand);
  // Wait for the function to reach Active state
  const func = await waitForLambda(
    region,
    FunctionName,
    MaxFunctionWaitTime,
    true,
    logger
  );
  if (!func) {
    logger(
      chalk.red(
        `function was created but did not reach the Active state within ${MaxFunctionWaitTime} seconds`
      )
    );
    logger(
      chalk.red(
        `rerun the command to ensure the function is up to date or check the status in AWS`
      )
    );
    process.exit(1);
  }

  // Set up event source mapping from SQS to the Lambda
  const queueUrl = (await getOneLetsGoQueue(region, deployment, logger)) || "";
  if (!queueUrl) {
    logger(
      chalk.red(
        `no queue found for deployment ${deployment}, redeploy the worker to create a queue`
      ),
      "aws:sqs"
    );
    process.exit(1);
  }
  const queueArn = await getQueueArnFromQueueUrl(region, queueUrl);
  const eventSourceMapping = await createEventSourceMapping(
    region,
    FunctionName,
    queueArn,
    settings,
    config,
    logger
  );

  logger(`worker created`, "aws:lambda");
}

export async function updateLambda(
  region: string,
  deployment: string,
  existingFunction: GetFunctionCommandOutput,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  imageTag: string,
  logger: Logger
): Promise<void> {
  const FunctionName = settings.getLambdaFunctionName(deployment);
  logger(
    `updating existing Lambda function '${FunctionName}'...`,
    "aws:lambda"
  );

  // Check if image needs to be updated
  const ecrRepositoryName = settings.getEcrRepositoryName(deployment);
  const ecrRepositoryArn = await getEcrRepositoryArn(region, ecrRepositoryName);
  const ImageUri = `${ecrRepositoryArn}:${imageTag}`;
  const imageNeedsUpdate =
    existingFunction.Code?.ImageUri !== ImageUri ||
    existingFunction.Configuration?.PackageType !== "Image";

  // Check if config needs to be updated
  const configNeedsUpdate =
    existingFunction.Configuration?.Timeout !==
      +config[settings.defaultConfig.functionTimeout[0]] ||
    existingFunction.Configuration?.MemorySize !==
      +config[settings.defaultConfig.functionMemory[0]] ||
    existingFunction.Configuration?.EphemeralStorage?.Size !==
      +config[settings.defaultConfig.functionEphemeralStorage[0]];

  // Check if environment variables need to be updated
  const existingEnvironment =
    existingFunction.Configuration?.Environment?.Variables || {};
  const desiredEnvironment: { [key: string]: string } = {
    LETSGO_DEPLOYMENT: deployment,
    ...config,
  };
  const environmentNeedsUpdate =
    Object.keys(desiredEnvironment).length !==
      Object.keys(existingEnvironment).length ||
    Object.keys(desiredEnvironment).some(
      (key) => desiredEnvironment[key] !== existingEnvironment[key]
    );

  // Check if EventSource needs to be updated
  const queueUrl = (await getOneLetsGoQueue(region, deployment, logger)) || "";
  if (!queueUrl) {
    logger(
      chalk.red(
        `no queue found for deployment ${deployment}, redeploy the worker to create a queue`
      ),
      "aws:sqs"
    );
    process.exit(1);
  }
  const queueArn = await getQueueArnFromQueueUrl(region, queueUrl);
  const eventSourceMapping = await getEventSourceMapping(
    region,
    FunctionName,
    queueArn,
    logger
  );
  const eventSourceNeedsUpdate =
    eventSourceMapping &&
    (eventSourceMapping.BatchSize !==
      +config[settings.defaultConfig.batchSize[0]] ||
      eventSourceMapping.MaximumBatchingWindowInSeconds !==
        +config[settings.defaultConfig.batchingWindow[0]] ||
      eventSourceMapping.ScalingConfig?.MaximumConcurrency !==
        +config[settings.defaultConfig.concurrency[0]]);

  // Update Lambda function
  const lambda = getLambdaClient(region);
  if (imageNeedsUpdate) {
    // Update image
    if (imageNeedsUpdate) {
      logger(`updating function image to ${ImageUri}...`, "aws:lambda");
      const updateImageCommand = new UpdateFunctionCodeCommand({
        FunctionName,
        ImageUri,
      });
      await lambda.send(updateImageCommand);
    }
  }
  if (configNeedsUpdate || environmentNeedsUpdate) {
    // Update config
    const updateConfigurationCommand = new UpdateFunctionConfigurationCommand({
      FunctionName,
      Timeout: +config[settings.defaultConfig.functionTimeout[0]],
      MemorySize: +config[settings.defaultConfig.functionMemory[0]],
      Environment: {
        Variables: desiredEnvironment,
      },
      EphemeralStorage: {
        Size: +config[settings.defaultConfig.functionEphemeralStorage[0]],
      },
    });
    await lambda.send(updateConfigurationCommand);
  }
  if (imageNeedsUpdate || configNeedsUpdate || environmentNeedsUpdate) {
    const func = await waitForLambda(
      region,
      FunctionName,
      MaxFunctionWaitTime,
      false,
      logger
    );
    if (!func) {
      logger(
        chalk.red(
          `function was updated but did not reach the Active state within ${MaxFunctionWaitTime} seconds`
        )
      );
      logger(
        chalk.red(
          `rerun the command to ensure the function is up to date or check the status in AWS`
        )
      );
    }

    const tagLambdaCommand = new TagResourceCommand({
      Resource: existingFunction.Configuration?.FunctionArn || "",
      Tags: getTagsAsObject(region, deployment),
    });
    await lambda.send(tagLambdaCommand);
  }

  // Update or re-create EventSourceMapping
  if (!eventSourceMapping) {
    await createEventSourceMapping(
      region,
      FunctionName,
      queueArn,
      settings,
      config,
      logger
    );
  } else if (eventSourceNeedsUpdate) {
    const updateEventSourceMappingCommand = new UpdateEventSourceMappingCommand(
      {
        UUID: eventSourceMapping.UUID || "",
        BatchSize: +config[settings.defaultConfig.batchSize[0]],
        MaximumBatchingWindowInSeconds:
          +config[settings.defaultConfig.batchingWindow[0]],
        ScalingConfig: {
          MaximumConcurrency: +config[settings.defaultConfig.concurrency[0]],
        },
      }
    );
    await lambda.send(updateEventSourceMappingCommand);
    const waitResult = await waitForEventSourceMapping(
      region,
      eventSourceMapping.UUID || "",
      MaxEventSourceMappingWaitTime,
      "Updating",
      eventSourceMapping.State,
      logger
    );
    if (!waitResult) {
      logger(
        chalk.red(
          `event source mapping was created but did not reach ${eventSourceMapping.State} state within ${MaxEventSourceMappingWaitTime} seconds`
        )
      );
      logger(
        chalk.red(
          `rerun the command to ensure the event source mapping is up to date or check the status in AWS`
        )
      );
      process.exit(1);
    }
  }

  logger(`worker is up to date`, "aws:lambda");
}

export async function getLambda(
  region: string,
  functionName: string
): Promise<GetFunctionCommandOutput | undefined> {
  const lambda = getLambdaClient(region);
  const command = new GetFunctionCommand({
    FunctionName: functionName,
  });
  try {
    const result = await lambda.send(command);
    return result;
  } catch (e: any) {
    if (e.name !== "ResourceNotFoundException") {
      throw e;
    }
  }
  return undefined;
}

export async function ensureLambda(
  region: string,
  deployment: string,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  imageTag: string,
  logger: Logger
): Promise<void> {
  const functionName = settings.getLambdaFunctionName(deployment);
  logger(`ensuring lambda function ${functionName} is set up...`, "aws:lambda");
  const worker = await getLambda(region, functionName);
  if (worker) {
    await updateLambda(
      region,
      deployment,
      worker,
      settings,
      config,
      imageTag,
      logger
    );
  } else {
    await createLambda(region, deployment, settings, config, imageTag, logger);
  }
}

export async function deleteLambda(
  region: string,
  functionName: string,
  logger: Logger
) {
  const existing = await getLambda(region, functionName);
  if (!existing) {
    return;
  }
  logger(`deleting function ${functionName}...`, "aws:lambda");
  const lambda = getLambdaClient(region);
  const deleteCommand = new DeleteFunctionCommand({
    FunctionName: functionName,
  });
  await lambda.send(deleteCommand);
  logger(`function ${functionName} deleted`, "aws:lambda");
}
