import { Command, Option } from "commander";
import { deleteConfig } from "../aws/ssm";
import {
  listLetsGoAppRunnerServices,
  deleteAppRunnerService,
  deleteUnusedAutoScalingConfigurations,
} from "../aws/apprunner";
import { deleteRepository } from "../aws/ecr";
import chalk from "chalk";
import {
  DefaultRegion,
  DefaultDeployment,
  ApiConfiguration,
  WebConfiguration,
  AppRunnerSettings,
  DBConfiguration,
} from "../vendor";
import { Logger, createLogger, getArtifacts } from "./defaults";
import { deleteRole } from "../aws/iam";
import { deleteDynamo } from "../aws/dynamodb";

const program = new Command();

const AllArtifacts = ["all", "api", "web", "db", "configuration"];

async function deleteAppRunnerServices(
  region: string,
  deployment: string,
  component: string,
  logger: Logger
) {
  logger("finding services to delete...");
  const services = await listLetsGoAppRunnerServices(
    region,
    deployment,
    component
  );
  if (services.length === 0) {
    logger("no services found");
    return;
  }
  logger(
    `deleting ${services.length} service${services.length === 1 ? "" : "s"}...`
  );
  const parallel: Promise<any>[] = [];
  services.forEach((service) => {
    parallel.push(
      (async () => {
        await deleteAppRunnerService(region, service.ServiceArn || "", logger);
        logger(`deleted service ${service.ServiceName}`);
      })()
    );
  });
  await Promise.all(parallel);
}

async function deleteAppRunner(
  region: string,
  deployment: string,
  settings: AppRunnerSettings,
  skipEcr: boolean
) {
  const logger = createLogger(
    `aws:apprunner`,
    region,
    deployment,
    settings.Name
  );
  const stage1: Promise<any>[] = [
    deleteAppRunnerServices(region, deployment, settings.Name, logger),
    ...(skipEcr
      ? []
      : [
          deleteRepository(
            region,
            settings.getEcrRepositoryName(deployment),
            logger
          ),
        ]),
  ];
  await Promise.all(stage1);
  const stage2: Promise<any>[] = [
    deleteUnusedAutoScalingConfigurations(
      region,
      settings.getAppRunnerAutoScalingConfigurationName(deployment),
      logger
    ),
    deleteRole(
      settings.getRoleName(region, deployment),
      settings.getPolicyName(region, deployment),
      logger
    ),
  ];
  await Promise.all(stage2);
  logger(`all service components ${skipEcr ? `except ECR ` : ``}were deleted`);
}

async function deleteConfiguration(region: string, deployment: string) {
  const logger = createLogger("aws:ssm", region, deployment);
  logger("deleting configuration...");
  const deleted = await deleteConfig(region, deployment);
  logger(`deleted ${deleted.length} configuration keys`);
}

program
  .name("rm")
  .summary("Remove artifacts from AWS")
  .description(
    `Remove selected artifacts of a deployment from AWS. Specify the artifacts to remove using the '-a' option. This action cannot be undone.`
  )
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(
    new Option("-a, --artifact [component...]", "Artifact").choices(
      AllArtifacts
    )
  )
  .option(`--leave-api-ecr`, `Leave ECR for api images in place`)
  .option(`--leave-web-ecr`, `Leave ECR for web images in place`)
  .action(async (options) => {
    options.artifact = options.artifact || [];
    if (options.artifact.length === 0) {
      console.log(
        chalk.yellow("No artifacts to remove specified. Use the '-a' option.")
      );
      return;
    }
    console.log(
      `Removing ${chalk.bold(
        options.artifact.sort().join(", ")
      )} from ${chalk.bold(`${options.region}/${options.deployment}`)}...`
    );
    const artifacts = getArtifacts(options.artifact, AllArtifacts);

    const step1: Promise<any>[] = [];
    if (artifacts.web) {
      step1.push(
        deleteAppRunner(
          options.region,
          options.deployment,
          WebConfiguration,
          options.leaveWebEcr
        )
      );
    }
    if (artifacts.api) {
      step1.push(
        deleteAppRunner(
          options.region,
          options.deployment,
          ApiConfiguration,
          options.leaveApiEcr
        )
      );
    }
    if (step1.length > 0) {
      await Promise.all(step1);
    }
    const step2: Promise<any>[] = [];
    if (artifacts.configuration) {
      step2.push(deleteConfiguration(options.region, options.deployment));
    }
    if (artifacts.db) {
      step2.push(
        deleteDynamo(
          options.region,
          options.deployment,
          DBConfiguration,
          createLogger(
            "aws:dynamodb",
            options.region,
            options.deployment,
            "aws:dynamodb"
          )
        )
      );
    }
    if (step2.length > 0) {
      await Promise.all(step2);
    }
    console.log(
      `Removed: ${chalk.bold(Object.keys(artifacts).sort().join(", "))}`
    );
  });

export default program;
