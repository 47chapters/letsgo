import { Command, Option } from "commander";
import {
  AppRunnerAssumeRolePolicy,
  LambdaAssumeRolePolicy,
  ensureRole,
  getRoleArn,
} from "../aws/iam";
import { getAccountId } from "../aws/sts";
import { ensureRepository, ensureImage } from "../aws/ecr";
import { ensureAppRunner } from "../aws/apprunner";
import chalk from "chalk";
import { createLogger, getArtifacts } from "./defaults";
import {
  DefaultRegion,
  DefaultDeployment,
  ApiConfiguration,
  WebConfiguration,
  AppRunnerSettings,
  DBSettings,
  DBConfiguration,
  WorkerConfiguration,
  WorkerSettings,
} from "../vendor";
import { join } from "path";
import { readFileSync } from "fs";
import {
  LetsGoDeploymentConfig,
  ensureDefaultConfig,
  SetConfigValueCallback,
  setConfigValue,
} from "../aws/ssm";
import { ensureDynamo } from "../aws/dynamodb";
import { ensureQueue } from "../aws/sqs";
import { ensureLambda } from "../aws/lambda";

const AllArtifacts = ["all", "api", "web", "db", "worker"];

function readLastBuildTag(component: string): string | undefined {
  try {
    return readFileSync(
      join(__dirname, "..", "..", "..", component, "buildx", "tag"),
      "utf8"
    );
  } catch (_) {
    return undefined;
  }
}

const ApiSha = readLastBuildTag("api");
const WebSha = readLastBuildTag("web");
const WorkerSha = readLastBuildTag("worker");

const program = new Command();

async function deployAppRunner(
  options: any,
  imageTag: string,
  settings: AppRunnerSettings
): Promise<void> {
  if (!imageTag) {
    console.log(
      chalk.red(
        `No '${settings.Name}' docker image tag specified, and no local build exists. Use the '--${settings.Name}-tag' option to specify the docker image tag to deploy, or build the docker image locally using 'yarn ops buildx'.`
      )
    );
    process.exit(1);
  }
  // Default logger
  const logger = createLogger(
    `aws:apprunner`,
    options.region,
    options.deployment,
    settings.Name
  );
  // Populate default configuration values
  logger(
    "reading current config and ensuring default configuration values are set",
    "aws:ssm"
  );
  const config = (await ensureDefaultConfig(
    options.region,
    options.deployment,
    settings.defaultConfig
  )) as LetsGoDeploymentConfig;
  const createSetConfigValueCallback =
    (key: string): SetConfigValueCallback =>
    async (value: string) => {
      await setConfigValue(options.region, options.deployment, key, value);
      config[key] = value;
    };
  // Ensure IAM role is configured
  const roleName = settings.getRoleName(options.region, options.deployment);
  logger("ensuring IAM role is configured", "aws:iam");
  await ensureRole(
    options.region,
    options.deployment,
    roleName,
    settings.getPolicyName(options.region, options.deployment),
    [],
    settings.getInlineRolePolicy(
      await getAccountId(),
      options.region,
      options.deployment
    ),
    AppRunnerAssumeRolePolicy
  );
  // Ensure ECR repository images exists
  logger("ensuring ECR repository exists", "aws:ecr");
  await ensureRepository(
    options.region,
    options.deployment,
    settings.getEcrRepositoryName(options.deployment)
  );
  // Ensure ECR image exists
  logger("ensuring ECR image exists", "aws:ecr");
  await ensureImage(
    options.region,
    settings.getEcrRepositoryName(options.deployment),
    settings.getLocalRepositoryName(options.deployment),
    imageTag,
    logger
  );
  // Ensure AppRunner service for the API exists and is up to date
  const roleArn = await getRoleArn(roleName);
  logger("ensuring service exists and is up to date");
  await ensureAppRunner({
    region: options.region,
    deployment: options.deployment,
    component: settings.Name,
    ecrRepositoryName: settings.getEcrRepositoryName(options.deployment),
    ignoreConfigKeys: [settings.serviceUrlConfigKey],
    setAppRunnerUrl: createSetConfigValueCallback(settings.serviceUrlConfigKey),
    imageTag: imageTag,
    autoScalingConfigurationName:
      settings.getAppRunnerAutoScalingConfigurationName(options.deployment),
    autoScaling: {
      minSize: +config[settings.defaultConfig.minSize[0]],
      maxSize: +config[settings.defaultConfig.maxSize[0]],
      maxConcurrency: +config[settings.defaultConfig.maxConcurrency[0]],
    },
    appRunnerServiceName: settings.getAppRunnerServiceName(options.deployment),
    appRunnerInstanceRoleArn: roleArn,
    appRunnerCpu: config[settings.defaultConfig.cpu[0]],
    appRunnerMemory: config[settings.defaultConfig.memory[0]],
    healthCheck: {
      path: config[settings.defaultConfig.healthPath[0]],
      interval: +config[settings.defaultConfig.healthInterval[0]],
      timeout: +config[settings.defaultConfig.healthTimeout[0]],
      healthyThreshold:
        +config[settings.defaultConfig.healthHealthyThreshold[0]],
      unhealthyThreshold:
        +config[settings.defaultConfig.healthUnhealthyThreshold[0]],
    },
    logger,
  });
}

async function deployDb(options: any, settings: DBSettings) {
  await ensureDynamo(
    options.region,
    options.deployment,
    settings,
    createLogger("aws:dynamodb", options.region, options.deployment)
  );
}

async function deployWorker(options: any, settings: WorkerSettings) {
  if (!options.workerTag) {
    console.log(
      chalk.red(
        `No 'worker' docker image tag specified, and no local build exists. Use the '--worker-tag' option to specify the docker image tag to deploy, or build the docker image locally using 'yarn ops buildx'.`
      )
    );
    process.exit(1);
  }
  const logger = createLogger(
    "aws:worker",
    options.region,
    options.deployment,
    "worker"
  );
  // Populate default configuration values
  logger(
    "reading current config and ensuring default configuration values are set",
    "aws:ssm"
  );
  const config = (await ensureDefaultConfig(
    options.region,
    options.deployment,
    settings.defaultConfig
  )) as LetsGoDeploymentConfig;
  // Ensure IAM role is configured
  const roleName = settings.getRoleName(options.region, options.deployment);
  logger("ensuring IAM role is configured", "aws:iam");
  await ensureRole(
    options.region,
    options.deployment,
    roleName,
    settings.getPolicyName(options.region, options.deployment),
    [],
    settings.getInlineRolePolicy(
      await getAccountId(),
      options.region,
      options.deployment
    ),
    LambdaAssumeRolePolicy
  );
  // Ensure SQS queue is set up
  logger("ensuring SQS queue is set up...", "aws:sqs");
  await ensureQueue(
    options.region,
    options.deployment,
    settings,
    config,
    logger
  );
  // Ensure ECR repository images exists
  logger("ensuring ECR repository exists", "aws:ecr");
  await ensureRepository(
    options.region,
    options.deployment,
    settings.getEcrRepositoryName(options.deployment)
  );
  // Ensure ECR image exists
  logger("ensuring ECR image exists", "aws:ecr");
  await ensureImage(
    options.region,
    settings.getEcrRepositoryName(options.deployment),
    settings.getLocalRepositoryName(options.deployment),
    options.workerTag,
    logger
  );
  // Ensure worker Lambda exists
  logger("ensuring worker Lambda function exists", "aws:lambda");
  await ensureLambda(
    options.region,
    options.deployment,
    settings,
    config,
    options.workerTag,
    logger
  );
}

program
  .name("deploy")
  .summary("Deploy artifacts to AWS")
  .description(
    `Deploy all or selected artifacts to AWS. Specify the artifacts to deploy using the '-a' option. This action is eventually consistent.`
  )
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(
    new Option("-a, --artifact [component...]", "Artifact").choices(
      AllArtifacts
    )
  )
  .option(
    "--api-tag [sha]",
    "The docker image tag of the 'api' docker image to deploy. Defaults to the last locally built image.",
    ApiSha
  )
  .option(
    "--web-tag [sha]",
    "The docker image tag of the 'web' docker image to deploy. Defaults to the last locally built image.",
    WebSha
  )
  .option(
    "--worker-tag [sha]",
    "The docker image tag of the 'worker' docker image to deploy. Defaults to the last locally built image.",
    WorkerSha
  )
  .action(async (options) => {
    options.artifact = options.artifact || [];
    if (options.artifact.length === 0) {
      console.log(
        chalk.yellow("No artifacts to deploy specified. Use the '-a' option.")
      );
      return;
    }
    console.log(
      `Deploying ${chalk.bold(
        options.artifact.sort().join(", ")
      )} to ${chalk.bold(`${options.region}/${options.deployment}`)}...`
    );
    const artifacts = getArtifacts(options.artifact, AllArtifacts);

    if (artifacts.db) {
      await deployDb(options, DBConfiguration);
    }
    if (artifacts.worker) {
      await deployWorker(options, WorkerConfiguration);
    }
    if (artifacts.api) {
      await deployAppRunner(options, options.apiTag, ApiConfiguration);
    }
    if (artifacts.web) {
      await deployAppRunner(options, options.webTag, WebConfiguration);
    }
    console.log(
      `Deployed: ${chalk.bold(Object.keys(artifacts).sort().join(", "))}`
    );
  });

export default program;
