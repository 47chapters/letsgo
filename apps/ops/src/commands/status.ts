import { Command, Option } from "commander";
import chalk from "chalk";
import {
  ApiConfiguration,
  DBConfiguration,
  WebConfiguration,
  WorkerConfiguration,
  AppRunnerSettings,
  DBSettings,
  WorkerSettings,
  DefaultRegion,
  DefaultDeployment,
} from "@letsgo/constants";
import { getArtifacts } from "./defaults";
import {
  describeAutoScalingConfiguration,
  describeCustomDomains,
  describeService,
  listLetsGoAppRunnerServices,
} from "../aws/apprunner";
import { describeLogGroups } from "../aws/cloudwatch";
import { getLambda, listEventSourceMappings } from "../aws/lambda";
import { describeQueue } from "../aws/sqs";
import { listLetsGoQueues } from "@letsgo/queue";
import { getTable } from "../aws/dynamodb";
import {
  AutoScalingConfiguration,
  CustomDomain,
  CustomDomainAssociationStatus,
  Service,
} from "@aws-sdk/client-apprunner";
import {
  EventSourceMappingConfiguration,
  GetFunctionCommandOutput,
} from "@aws-sdk/client-lambda";
import { TableDescription } from "@aws-sdk/client-dynamodb";
import { get } from "https";
import { LogGroup } from "@aws-sdk/client-cloudwatch-logs";
import { GetScheduleCommandOutput } from "@aws-sdk/client-scheduler";
import { getSchedule } from "../aws/scheduler";
import e from "express";

const AllArtifacts = ["all", "api", "web", "db", "worker"];

interface AppRunnerStatus {
  apprunner?: Service;
  autoScalingConfiguration?: AutoScalingConfiguration;
  customDomains: CustomDomain[];
  logGroups: LogGroup[];
  health?: string | Error;
}

interface ErrorStatus {
  error: string;
}

interface WorkerStatus {
  lambda?: GetFunctionCommandOutput | null;
  sqs?: { [key: string]: string } | { error: string } | ErrorStatus | null;
  eventMapping?: EventSourceMappingConfiguration | ErrorStatus | null;
  schedule?: GetScheduleCommandOutput | ErrorStatus | null;
  logGroup?: LogGroup;
}

interface Status {
  web?: AppRunnerStatus | ErrorStatus | null;
  api?: AppRunnerStatus | ErrorStatus | null;
  worker?: WorkerStatus | null;
  db?: TableDescription | null;
}

export function isErrorStatus(o: any): o is ErrorStatus {
  return typeof (<ErrorStatus>o.error) === "string";
}

const program = new Command();

export async function getAppRunnerStatus(
  region: string,
  deployment: string,
  settings: AppRunnerSettings
): Promise<AppRunnerStatus | ErrorStatus | null> {
  const services = await listLetsGoAppRunnerServices(
    region,
    deployment,
    settings.Name
  );
  if (services.length === 0) {
    return null;
  }
  if (services.length > 1) {
    return {
      error: `Found ${services.length} ${settings.Name} services in ${region}/${deployment} while expecting one.`,
    };
  }
  const apprunner = await describeService(region, services[0].ServiceArn || "");
  const autoScalingConfiguration = await describeAutoScalingConfiguration(
    region,
    apprunner?.AutoScalingConfigurationSummary?.AutoScalingConfigurationArn ||
      ""
  );
  const customDomains = await describeCustomDomains(
    region,
    services[0].ServiceArn || ""
  );
  const logGroupNamePrefix = `/aws/apprunner/${services[0].ServiceName}/${services[0].ServiceId}/`;
  const logGroups = await describeLogGroups(region, logGroupNamePrefix);
  return { apprunner, autoScalingConfiguration, customDomains, logGroups };
}

async function getDbStatus(
  region: string,
  deployment: string,
  settings: DBSettings
): Promise<TableDescription | null> {
  const dynamodb = await getTable(region, deployment, settings);
  return dynamodb ? dynamodb : null;
}

async function getWorkerStatus(
  region: string,
  deployment: string,
  settings: WorkerSettings
): Promise<WorkerStatus | null> {
  const functionName = settings.getLambdaFunctionName(deployment);
  let lambda: GetFunctionCommandOutput | undefined | null = await getLambda(
    region,
    functionName
  );
  let logGroup: LogGroup | undefined;
  if (lambda) {
    delete (lambda as any).$metadata;
    const logGroupNamePrefix = `/aws/lambda/${functionName}`;
    const logGroups = await describeLogGroups(region, logGroupNamePrefix);
    logGroup = logGroups[0];
  } else {
    lambda = null;
  }
  let sqs: any;
  let eventMapping: any;
  const queueUrls = await listLetsGoQueues(region, deployment);
  if (queueUrls.length === 0) {
    sqs = null;
  } else if (queueUrls.length > 1) {
    sqs = {
      error: `Found ${queueUrls.length} queues in ${region}/${deployment} while expecting one.`,
    };
  } else {
    sqs = await describeQueue(region, queueUrls[0]);
    const eventSourceMappings = await listEventSourceMappings(
      region,
      functionName,
      sqs.QueueArn || ""
    );
    if (eventSourceMappings.length === 0) {
      eventMapping = null;
    } else if (eventSourceMappings.length > 1) {
      eventMapping = {
        error: `Found ${eventSourceMappings.length} event source mappings in ${region}/${deployment} while expecting one.`,
      };
    } else {
      eventMapping = eventSourceMappings[0];
    }
  }
  let schedule: GetScheduleCommandOutput | ErrorStatus | null;
  try {
    schedule = (await getSchedule(region, deployment, settings)) || null;
  } catch (e: any) {
    schedule = { error: e.message };
  }
  return lambda || sqs || eventMapping || schedule || logGroup
    ? { lambda, sqs, eventMapping, schedule, logGroup }
    : null;
}

function printLine(key: string, value: string) {
  console.log(`    ${chalk.bold(key.padEnd(15, " "))}${value}`);
}

async function checkHealth(
  service: AppRunnerStatus | ErrorStatus | null
): Promise<void> {
  return new Promise((resolve) => {
    if (service && !isErrorStatus(service)) {
      let done = false;
      const url = `https://${service.apprunner?.ServiceUrl}${service.apprunner?.HealthCheckConfiguration?.Path}`;
      const timeout = service.apprunner?.HealthCheckConfiguration?.Timeout || 5;
      let tripline = setTimeout(() => {
        service.health = new Error(`No response within ${timeout}s`);
        done = true;
        resolve(undefined);
      }, timeout * 1000);
      const start = Date.now();
      const req = get(url, (res) => {
        if (!done) {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            service.health = `HTTP ${res.statusCode} (${Date.now() - start}ms)`;
          } else {
            service.health = new Error(`HTTP ${res.statusCode}`);
          }
          clearTimeout(tripline);
          done = true;
          resolve(undefined);
        }
        res.on("data", () => {});
      });
      req.on("error", (err) => {
        if (!done) {
          service.health = err;
          clearTimeout(tripline);
          done = true;
          resolve(undefined);
        }
      });
    } else {
      resolve(undefined);
    }
  });
}

function getMB(bytes: number) {
  return `${Math.round((bytes / 1024 / 1024) * 1000) / 1000}`;
}

function printLogGroups(logGroups: LogGroup[]) {
  const getLogGroupLine = (logGroup: LogGroup) =>
    logGroup
      ? `${logGroup.logGroupName} (${getMB(logGroup.storedBytes || 0)} MB, ${
          logGroup.retentionInDays
            ? `${logGroup.retentionInDays} days retention`
            : "never expires"
        })`
      : "None";
  printLine("LogGroups", getLogGroupLine(logGroups[0]));
  for (let i = 1; i < logGroups.length; i++) {
    printLine("", getLogGroupLine(logGroups[i]));
  }
}

function printAppRunnerStatus(
  comopnent: string,
  status: AppRunnerStatus | ErrorStatus | null | undefined
) {
  if (!status) {
    console.log(`${chalk.bold.blue(comopnent)}: ${chalk.red("Not found")}`);
  } else if (isErrorStatus(status)) {
    console.log(`${chalk.bold.blue(comopnent)}: ${chalk.red(status.error)}`);
  } else {
    console.log(`${chalk.bold.blue(comopnent)}`);
    console.log(`${chalk.bold("  Service")}`);
    const statusColor =
      status.apprunner?.Status === "RUNNING"
        ? chalk.green
        : status.apprunner?.Status?.match(/FAILED/)
        ? chalk.red
        : chalk.yellow;
    printLine("Status", statusColor(status.apprunner?.Status || ""));
    const healthColor =
      typeof status.health === "string"
        ? chalk.green
        : status.health instanceof Error
        ? chalk.red
        : chalk.yellow;
    const healthValue =
      status.health === undefined
        ? "Unknown"
        : status.health instanceof Error
        ? status.health.message
        : status.health;
    printLine("Health", healthColor(healthValue));
    printLine("Url", `https://${status.apprunner?.ServiceUrl}`);
    if (status.customDomains.length === 1) {
      const customDomain = status.customDomains[0];
      const domainColor =
        customDomain.Status?.toLowerCase() ===
        CustomDomainAssociationStatus.ACTIVE.toLowerCase()
          ? chalk.green
          : customDomain.Status?.match(/failed/)
          ? chalk.red
          : chalk.yellow;
      printLine(
        "CustomDomain",
        `${customDomain.DomainName}${
          customDomain.EnableWWWSubdomain
            ? `, www.${customDomain.DomainName}`
            : ``
        } (${domainColor(customDomain.Status)})`
      );
    } else if (status.customDomains.length > 1) {
      printLine(
        "CustomDomain",
        chalk.red(
          "Multiple custom domains are present - resolve this with AWS console/CLI."
        )
      );
    } else {
      printLine("CustomDomain", "Not configured");
    }
    const healthUrl = `https://${status.apprunner?.ServiceUrl}${status.apprunner?.HealthCheckConfiguration?.Path}`;
    printLine("HealthUrl", healthUrl);
    printLine("MinSize", `${status.autoScalingConfiguration?.MinSize}`);
    printLine("MaxSize", `${status.autoScalingConfiguration?.MaxSize}`);
    printLine(
      "Concurrency",
      `${status.autoScalingConfiguration?.MaxConcurrency}`
    );
    printLine("Cpu", status.apprunner?.InstanceConfiguration?.Cpu || "");
    printLine(
      "Memory",
      `${status.apprunner?.InstanceConfiguration?.Memory || ""} MB`
    );
    printLine(
      "Image",
      status.apprunner?.SourceConfiguration?.ImageRepository?.ImageIdentifier ||
        ""
    );
    printLine("Updated", `${status.apprunner?.UpdatedAt}`);
    printLogGroups(status.logGroups);
  }
}

function printWorkerStatus(status: WorkerStatus | null | undefined) {
  if (!status) {
    console.log(`${chalk.bold.blue("Worker")}: ${chalk.red("Not found")}`);
  } else {
    console.log(`${chalk.bold.blue("Worker")}`);
    if (!status.lambda) {
      console.log(`${chalk.bold("  Lambda")}: ${chalk.red("Not found")}`);
    } else if (isErrorStatus(status.lambda)) {
      console.log(
        `${chalk.bold("  Lambda")}: ${chalk.red(status.lambda.error)}`
      );
    } else {
      console.log(`${chalk.bold("  Lambda")}`);
      const lambdaStateColor =
        status.lambda?.Configuration?.State === "Active"
          ? chalk.green
          : status.lambda?.Configuration?.State === "Failed"
          ? chalk.red
          : chalk.yellow;
      printLine(
        "State",
        lambdaStateColor(status.lambda?.Configuration?.State || "")
      );
      printLine("Memory", `${status.lambda?.Configuration?.MemorySize} MB`);
      printLine("Timeout", `${status.lambda?.Configuration?.Timeout}s`);
      printLine(
        "Storage",
        `${status.lambda?.Configuration?.EphemeralStorage?.Size} MB`
      );
      printLine("Image", `${status.lambda?.Code?.ImageUri}`);
      printLine("Arn", `${status.lambda?.Configuration?.FunctionArn}`);
      printLine(
        "Updated",
        `${new Date(status.lambda?.Configuration?.LastModified as string)}`
      );
      printLogGroups(status.logGroup ? [status.logGroup] : []);
    }
    if (!status.sqs) {
      console.log(`${chalk.bold("  SQS")}: ${chalk.red("Not found")}`);
    } else if (isErrorStatus(status.sqs)) {
      console.log(`${chalk.bold("  SQS")}: ${chalk.red(status.sqs.error)}`);
    } else {
      console.log(`${chalk.bold("  SQS")}`);
      printLine("~Messages", `${status.sqs?.["ApproximateNumberOfMessages"]}`);
      printLine(
        "~NotVisible",
        `${status.sqs?.["ApproximateNumberOfMessagesNotVisible"]}`
      );
      printLine(
        "~Delayed",
        `${status.sqs?.["ApproximateNumberOfMessagesDelayed"]}`
      );
      printLine("Visibility", `${status.sqs?.["VisibilityTimeout"]}s`);
      printLine("Retention", `${status.sqs?.["MessageRetentionPeriod"]}s`);
      printLine(
        "ReceiveWait",
        `${status.sqs?.["ReceiveMessageWaitTimeSeconds"]}s`
      );
      printLine("Arn", `${status.sqs?.["QueueArn"]}`);
      printLine(
        "Updated",
        `${new Date(+(status.sqs?.["LastModifiedTimestamp"] as string) * 1000)}`
      );
    }
    if (!status.eventMapping) {
      console.log(`${chalk.bold("  EventSource")}: ${chalk.red("Not found")}`);
    } else if (isErrorStatus(status.eventMapping)) {
      console.log(
        `${chalk.bold("  EventSource")}: ${chalk.red(
          status.eventMapping.error
        )}`
      );
    } else {
      console.log(`${chalk.bold("  EventSource")}`);
      const mappingStateColor =
        status.eventMapping?.State === "Enabled" ? chalk.green : chalk.yellow;
      printLine("State", mappingStateColor(status.eventMapping?.State || ""));
      printLine("BatchSize", `${status.eventMapping?.BatchSize}`);
      printLine(
        "BatchingWindow",
        `${status.eventMapping?.MaximumBatchingWindowInSeconds}s`
      );
      printLine(
        "Concurrency",
        `${status.eventMapping?.ScalingConfig?.MaximumConcurrency}`
      );
      printLine(
        "Updated",
        `${new Date(status.eventMapping?.LastModified || "")}`
      );
    }
    if (!status.schedule) {
      console.log(`${chalk.bold("  Schedule")}: ${chalk.red("Not found")}`);
    } else if (isErrorStatus(status.schedule)) {
      console.log(
        `${chalk.bold("  Schedule")}: ${chalk.red(status.schedule.error)}`
      );
    } else {
      console.log(`${chalk.bold("  Schedule")}`);
      const mappingStateColor =
        status.schedule?.State === "ENABLED" ? chalk.green : chalk.yellow;
      printLine("State", mappingStateColor(status.schedule?.State || ""));
      printLine("Expression", `${status.schedule?.ScheduleExpression}`);
      printLine("Timezone", `${status.schedule?.ScheduleExpressionTimezone}`);
      printLine("Arn", `${status.schedule?.Arn}`);
      printLine(
        "Updated",
        `${new Date(status.schedule?.LastModificationDate || "")}`
      );
    }
  }
}

function printDbStatus(
  status: TableDescription | ErrorStatus | null | undefined
) {
  if (!status) {
    console.log(`${chalk.bold.blue("Db")}: ${chalk.red("Not found")}`);
  } else if (isErrorStatus(status)) {
    console.log(`${chalk.bold.blue("Db")}: ${chalk.red(status.error)}`);
  } else {
    console.log(`${chalk.bold.blue("Db")}`);
    const statusColor =
      status.TableStatus === "ACTIVE"
        ? chalk.green
        : status.TableStatus?.match(/^(CREATING|UPDATING|DELETING)$/)
        ? chalk.yellow
        : chalk.red;
    printLine("Status", statusColor(status.TableStatus || ""));
    printLine("Items", `${status.ItemCount}`);
    printLine(
      "Size",
      `${
        Math.round(((status.TableSizeBytes || 0) / 1024 / 1024) * 1000) / 1000
      } MB`
    );
    printLine("Arn", `${status.TableArn}`);
  }
}

program
  .name("status")
  .summary("Get the status of a deployment")
  .description(
    `Get the overall status of a specific deployment in a region, or a single parameter of an existing deployment.`
  )
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(
    (() => {
      const option = new Option("-a, --artifact [component...]", "Artifact")
        .choices(AllArtifacts)
        .default(["all"]);
      option.required = true;
      return option;
    })()
  )
  .option(
    `-p, --property <property>`,
    `Path to a single property to return, e.g. db.TableStatus`
  )
  .addOption(
    new Option("-o, --output <format>", "Output format")
      .choices(["text", "json"])
      .default("text")
  )
  .action(async (options) => {
    const artifacts = getArtifacts(options.artifact || [], AllArtifacts);
    const status: Status = {};
    const results = await Promise.all([
      ...((artifacts.web && [
        getAppRunnerStatus(
          options.region,
          options.deployment,
          WebConfiguration
        ),
      ]) ||
        []),
      ...((artifacts.api && [
        getAppRunnerStatus(
          options.region,
          options.deployment,
          ApiConfiguration
        ),
      ]) ||
        []),
      ...((artifacts.worker && [
        getWorkerStatus(
          options.region,
          options.deployment,
          WorkerConfiguration
        ),
      ]) ||
        []),
      ...((artifacts.db && [
        getDbStatus(options.region, options.deployment, DBConfiguration),
      ]) ||
        []),
    ]);
    if (artifacts.web) {
      status.web = results.shift() as AppRunnerStatus | ErrorStatus | null;
      await checkHealth(status.web);
    }
    if (artifacts.api) {
      status.api = results.shift() as AppRunnerStatus | ErrorStatus | null;
      await checkHealth(status.api);
    }
    if (artifacts.worker) {
      status.worker = results.shift() as WorkerStatus | null;
    }
    if (artifacts.db) {
      status.db = results.shift() as TableDescription | null;
    }
    let property: any;
    if (options.property) {
      try {
        property = eval(`status.${options.property}`);
      } catch (err) {}
    }
    if (options.output === "json") {
      console.log(
        JSON.stringify(options.property ? property : status, null, 2)
      );
    } else {
      if (options.property) {
        if (property === undefined) {
          console.log(chalk.red(`Property not found`));
          process.exit(1);
        }
        if (typeof property === "string" || typeof property === "number") {
          console.log(property);
        } else {
          console.log(JSON.stringify(property, null, 2));
        }
      } else {
        console.log(
          `Status of deployment ${chalk.bold(
            `${options.region}/${options.deployment}`
          )}:`
        );
        artifacts.web && printAppRunnerStatus("Web", status.web);
        artifacts.api && printAppRunnerStatus("Api", status.api);
        artifacts.worker && printWorkerStatus(status.worker);
        artifacts.db && printDbStatus(status.db);
      }
    }
  });

export default program;
