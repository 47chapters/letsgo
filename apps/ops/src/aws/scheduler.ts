import {
  CreateScheduleCommand,
  CreateScheduleGroupCommand,
  DeleteScheduleCommand,
  DeleteScheduleGroupCommand,
  FlexibleTimeWindowMode,
  GetScheduleCommand,
  GetScheduleCommandOutput,
  ScheduleState,
  SchedulerClient,
  TagResourceCommand,
  UpdateScheduleCommand,
} from "@aws-sdk/client-scheduler";
import { getTags } from "./defaults";
import { WorkerSettings } from "@letsgo/constants";
import { Logger } from "../commands/defaults";
import { LetsGoDeploymentConfig } from "./ssm";
import { getFunctionArn } from "./lambda";
import { getRoleArn } from "./iam";
import { getAccountId } from "./sts";
import { get } from "http";
import chalk from "chalk";

const apiVersion = "2021-06-30";

function getSchedulerClient(region: string) {
  return new SchedulerClient({
    apiVersion,
    region,
  });
}

async function getScheduleGroupArn(region: string, scheduleGroupName: string) {
  return `arn:aws:scheduler:${region}:${await getAccountId()}:schedule-group/${scheduleGroupName}`;
}

export async function getSchedule(
  region: string,
  deployment: string,
  settings: WorkerSettings
): Promise<GetScheduleCommandOutput | undefined> {
  const scheduler = getSchedulerClient(region);
  const command = new GetScheduleCommand({
    Name: settings.getScheduleName(deployment),
    GroupName: settings.getScheduleName(deployment),
  });
  try {
    return await scheduler.send(command);
  } catch (e: any) {
    if (e.name !== "ResourceNotFoundException") {
      throw e;
    }
  }
  return undefined;
}

export async function enableOrDisableSchedule(
  region: string,
  deployment: string,
  settings: WorkerSettings,
  start: boolean,
  logger: Logger
) {
  logger(`${start ? "starting" : "stopping"} scheduler...`, "aws:scheduler");
  const existingSchedule = await getSchedule(region, deployment, settings);
  if (!existingSchedule) {
    logger(
      chalk.yellow(`cannot ${start ? "start" : "stop"} scheduler: not found`),
      "aws:scheduler"
    );
    return;
  }
  const scheduler = getSchedulerClient(region);
  const command = new UpdateScheduleCommand({
    Name: existingSchedule.Name,
    GroupName: existingSchedule.GroupName,
    ScheduleExpression: existingSchedule.ScheduleExpression,
    ScheduleExpressionTimezone: existingSchedule.ScheduleExpressionTimezone,
    FlexibleTimeWindow: existingSchedule.FlexibleTimeWindow,
    Target: existingSchedule.Target,
    State: start ? ScheduleState.ENABLED : ScheduleState.DISABLED,
  });
  await scheduler.send(command);
  const tagCommand = new TagResourceCommand({
    ResourceArn: await getScheduleGroupArn(
      region,
      existingSchedule.GroupName || ""
    ),
    Tags: getTags(region, deployment),
  });
  await scheduler.send(tagCommand);

  logger(`scheduler ${start ? "started" : "stopped"}`, "aws:scheduler");
}

export async function deleteSchedule(
  region: string,
  deployment: string,
  settings: WorkerSettings,
  logger: Logger
): Promise<void> {
  const scheduler = getSchedulerClient(region);
  const name = settings.getScheduleName(deployment);
  logger(`deleting schedule ${name}...`, "aws:scheduler");
  const command = new DeleteScheduleCommand({
    Name: name,
    GroupName: name,
  });
  try {
    await scheduler.send(command);
  } catch (e: any) {
    if (e.name !== "ResourceNotFoundException") {
      throw e;
    }
  }
  const deleteScheduleGroupCommand = new DeleteScheduleGroupCommand({
    Name: name,
  });
  try {
    await scheduler.send(deleteScheduleGroupCommand);
  } catch (e: any) {
    if (e.name !== "ResourceNotFoundException") {
      throw e;
    }
  }
}

async function updateSchedule(
  region: string,
  deployment: string,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  logger: Logger,
  existingSchedule: GetScheduleCommandOutput
): Promise<void> {
  logger(`updating schedule '${existingSchedule.Name}'...`, "aws:scheduler");
  const scheduler = getSchedulerClient(region);
  // Check if schedule needs to be updated
  const existingAttributes: { [key: string]: any } = {
    ScheduleExpression: existingSchedule.ScheduleExpression,
    ScheduleExpressionTimezone: existingSchedule.ScheduleExpressionTimezone,
  };
  const desiredAttrbutes: { [key: string]: any } = {
    ScheduleExpression: config[settings.defaultConfig.schedule[0]],
    ScheduleExpressionTimezone:
      config[settings.defaultConfig.scheduleTimezone[0]],
  };
  const needsUpdate = Object.keys(desiredAttrbutes).filter(
    (key) => existingAttributes[key] !== desiredAttrbutes[key]
  );
  if (needsUpdate.length > 0) {
    logger(
      `updating schedule attributes ${needsUpdate.join(", ")}...`,
      "aws:scheduler"
    );
    const command = new UpdateScheduleCommand({
      Name: existingSchedule.Name,
      GroupName: existingSchedule.GroupName,
      ScheduleExpression: desiredAttrbutes.ScheduleExpression,
      ScheduleExpressionTimezone: desiredAttrbutes.ScheduleExpressionTimezone,
      FlexibleTimeWindow: existingSchedule.FlexibleTimeWindow,
      Target: existingSchedule.Target,
      State: existingSchedule.State,
    });
    await scheduler.send(command);
    const tagCommand = new TagResourceCommand({
      ResourceArn: await getScheduleGroupArn(
        region,
        existingSchedule.GroupName || ""
      ),
      Tags: getTags(region, deployment),
    });
    await scheduler.send(tagCommand);
    logger(`schedule is up to date`, "aws:scheduler");
  }
}

async function createSchedule(
  region: string,
  deployment: string,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  logger: Logger
): Promise<void> {
  const scheduler = getSchedulerClient(region);
  const createScheduleGroupCommand = new CreateScheduleGroupCommand({
    Name: settings.getScheduleName(deployment),
    Tags: getTags(region, deployment),
  });
  try {
    await scheduler.send(createScheduleGroupCommand);
  } catch (e: any) {
    if (e.name !== "ConflictException") {
      throw e;
    }
  }
  const command = new CreateScheduleCommand({
    Name: settings.getScheduleName(deployment),
    GroupName: settings.getScheduleName(deployment),
    ScheduleExpression: config[settings.defaultConfig.schedule[0]],
    ScheduleExpressionTimezone:
      config[settings.defaultConfig.scheduleTimezone[0]],
    FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
    Target: {
      Arn: await getFunctionArn(
        region,
        settings.getLambdaFunctionName(deployment)
      ),
      RoleArn: await getRoleArn(settings.getRoleName(region, deployment)),
    },
    State: ScheduleState.ENABLED,
  });
  logger(
    `creating schedule '${command.input.Name}' with expression '${command.input.ScheduleExpression}' and TZ '${command.input.ScheduleExpressionTimezone}' for the worker...`,
    "aws:scheduler"
  );
  await scheduler.send(command);
}

export async function ensureSchedule(
  region: string,
  deployment: string,
  settings: WorkerSettings,
  config: LetsGoDeploymentConfig,
  logger: Logger
): Promise<void> {
  const existingSchedule = await getSchedule(region, deployment, settings);
  if (existingSchedule) {
    return updateSchedule(
      region,
      deployment,
      settings,
      config,
      logger,
      existingSchedule
    );
  } else {
    return createSchedule(region, deployment, settings, config, logger);
  }
}
