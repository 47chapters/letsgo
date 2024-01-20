import {
  AppRunnerClient,
  DescribeServiceCommand,
  CreateServiceCommand,
  Service,
  CreateAutoScalingConfigurationCommand,
  ListAutoScalingConfigurationsCommand,
  ListAutoScalingConfigurationsCommandInput,
  DeleteAutoScalingConfigurationCommand,
  DescribeAutoScalingConfigurationCommand,
  UpdateServiceCommand,
  TagResourceCommand,
  DeleteServiceCommand,
  DescribeServiceCommandOutput,
  ListServicesCommandInput,
  ListServicesCommand,
  ServiceSummary,
  ListTagsForResourceCommand,
  AutoScalingConfiguration,
  ResumeServiceCommand,
  PauseServiceCommand,
  DescribeCustomDomainsCommand,
  CustomDomain,
  AssociateCustomDomainCommand,
  DisassociateCustomDomainCommand,
  Tag,
  HealthCheckProtocol,
} from "@aws-sdk/client-apprunner";
import { setLogGroupRetentionPolicy } from "./cloudwatch";
import { getTags } from "./defaults";
import { getConfig } from "./ssm";
import chalk from "chalk";
import { getEcrRepositoryArn } from "./ecr";
import { Logger } from "../commands/defaults";
import {
  ApiConfiguration,
  AppRunnerSettings,
  ConfigSettings,
  TagKeys,
  WebConfiguration,
  VendorPrefix,
} from "@letsgo/constants";

const MaxWaitTimeForAppRunnerCreate = 60 * 15;
const MaxWaitTimeForAppRunnerUpdate = 60 * 15;
const MaxWaitTimeForCustomDomain = 60 * 1;
const apiVersion = "2020-05-15";

function getAppRunnerClient(region: string) {
  return new AppRunnerClient({
    apiVersion,
    region,
  });
}

export interface ServiceUrls {
  [component: string]: string;
}

export async function getServiceUrls(
  region: string,
  deployment: string
): Promise<ServiceUrls> {
  const services = await listLetsGoAppRunnerServices(region, deployment);
  const urls: ServiceUrls = {};
  for (const component of [ApiConfiguration.Name, WebConfiguration.Name]) {
    const service = services.find((service) =>
      service.Tags?.find(
        (tag) => tag.Key === TagKeys.LetsGoComponent && tag.Value === component
      )
    );
    if (service) {
      const customDomains = await describeCustomDomains(
        region,
        service.ServiceArn || ""
      );
      const serviceUrl =
        customDomains.length > 0
          ? customDomains[0].DomainName
          : service.ServiceUrl;
      urls[component] = `https://${serviceUrl}`;
    }
  }
  return urls;
}

export async function enableOrDisableService(
  region: string,
  deployment: string,
  settings: AppRunnerSettings,
  start: boolean,
  logger: Logger
) {
  logger(
    `${start ? "starting" : "stopping"} ${settings.Name} service...`,
    "aws:apprunner"
  );
  const service = await getOneLetsGoAppRunnerService(
    region,
    deployment,
    settings.Name,
    logger
  );
  if (service) {
    const expectedStatus = start ? "PAUSED" : "RUNNING";
    const desiredStatus = start ? "RUNNING" : "PAUSED";
    if (service.Status !== desiredStatus) {
      if (service.Status !== expectedStatus) {
        logger(
          chalk.red(
            `service ${settings.Name} is in an unexpected state '${service.Status}' (expected '${expectedStatus}')`
          ),
          "aws:lambda"
        );
        process.exit(1);
      }
      const apprunner = getAppRunnerClient(region);
      if (start) {
        const startCommand = new ResumeServiceCommand({
          ServiceArn: service.ServiceArn,
        });
        await apprunner.send(startCommand);
      } else {
        const stopCommand = new PauseServiceCommand({
          ServiceArn: service.ServiceArn,
        });
        await apprunner.send(stopCommand);
      }
    }
    await waitForAppRunnerService(
      region,
      settings.Name,
      service.ServiceArn || "",
      MaxWaitTimeForAppRunnerUpdate,
      "OPERATION_IN_PROGRESS",
      desiredStatus,
      logger
    );
    logger(
      `${settings.Name} service ${start ? "started" : "stopped"}`,
      "aws:apprunner"
    );
  } else {
    logger(
      chalk.yellow(
        `cannot ${start ? "start" : "stop"} ${
          settings.Name
        } service: service not found`
      ),
      "aws:apprunner"
    );
  }
}

export async function describeService(
  region: string,
  serviceArn?: string
): Promise<Service | undefined> {
  if (!serviceArn) {
    return undefined;
  }
  const apprunner = getAppRunnerClient(region);
  const command = new DescribeServiceCommand({
    ServiceArn: serviceArn,
  });
  try {
    const result = await apprunner.send(command);
    return result.Service;
  } catch (e: any) {
    if (e.name !== "ResourceNotFoundException") {
      throw e;
    }
    return undefined;
  }
}

export interface AutoScalingSettings {
  minSize: number;
  maxSize: number;
  maxConcurrency: number;
}

export interface HealthCheckSettings {
  path: string;
  interval: number;
  timeout: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
}

export interface EnsureAppRunnerOptions {
  region: string;
  deployment: string;
  component: string;
  ecrRepositoryName: string;
  imageTag: string;
  autoScalingConfigurationName: string;
  autoScaling: AutoScalingSettings;
  healthCheck: HealthCheckSettings;
  appRunnerServiceName: string;
  appRunnerInstanceRoleArn: string;
  appRunnerCpu?: string;
  appRunnerMemory?: string;
  ignoreConfigKeys: string[];
  logRetentionInDays: number;
  logger: Logger;
  serviceUrls: ServiceUrls;
}

export async function deleteUnusedAutoScalingConfigurations(
  region: string,
  autoScalingConfigurationName: string,
  logger: Logger
): Promise<void> {
  const apprunner = getAppRunnerClient(region);
  let listCommandInput: ListAutoScalingConfigurationsCommandInput = {
    AutoScalingConfigurationName: autoScalingConfigurationName,
  };
  while (true) {
    const listResult = await apprunner.send(
      new ListAutoScalingConfigurationsCommand(listCommandInput)
    );
    for (const revision of listResult.AutoScalingConfigurationSummaryList ||
      []) {
      if (
        !revision.HasAssociatedService &&
        revision?.Status?.toLowerCase() === "active"
      ) {
        logger(
          `deleting unused AutoScalingConfiguration ${revision.AutoScalingConfigurationArn}...`
        );
        const deleteAutoScalingCommand =
          new DeleteAutoScalingConfigurationCommand({
            AutoScalingConfigurationArn: revision.AutoScalingConfigurationArn,
          });
        await apprunner.send(deleteAutoScalingCommand);
      }
    }
    if (!listResult.NextToken) {
      break;
    }
    listCommandInput.NextToken = listResult.NextToken;
  }
}

async function waitForAppRunnerService(
  region: string,
  component: string,
  serviceArn: string,
  maxWait: number,
  inProgressStatus: string,
  terminalStatus: string | undefined,
  logger: Logger
): Promise<Service | undefined> {
  const apprunner = getAppRunnerClient(region);
  const command = new DescribeServiceCommand({
    ServiceArn: serviceArn,
  });
  let clock = 0;
  let delay = 1;
  while (true) {
    let result: DescribeServiceCommandOutput;
    try {
      result = await apprunner.send(command);
    } catch (e: any) {
      if (
        e.name === "ResourceNotFoundException" &&
        terminalStatus === "DELETED"
      ) {
        return undefined;
      }
      throw e;
    }
    logger(`${clock}s ${component} service status: ${result.Service?.Status}`);
    if (result.Service?.Status === terminalStatus) {
      return terminalStatus === "DELETED" ? undefined : result.Service;
    } else if (result.Service?.Status !== inProgressStatus) {
      logger(
        chalk.red(
          `failure updating ${component} service: unexpected service status ${result.Service?.Status}`
        )
      );
      process.exit(1);
    }
    if (clock >= maxWait) {
      return terminalStatus === "DELETED" ? result.Service : undefined;
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

async function waitForCustomDomain(
  region: string,
  serviceArn: string,
  maxWait: number,
  inProgressStatus: string[],
  terminalStatus: string[] | undefined,
  silentOutput: boolean,
  logger: Logger
): Promise<CustomDomain | undefined> {
  const apprunner = getAppRunnerClient(region);
  let clock = 0;
  let delay = 1;
  while (true) {
    const result = await describeCustomDomains(region, serviceArn);
    if (result.length !== 1) {
      logger(
        chalk.red(
          `discovered ${result.length} custom domains while expected 1`
        ),
        "aws:lambda"
      );
      process.exit(1);
    }
    const customDomain = result[0];
    !silentOutput &&
      logger(`${clock}s custom domain status: ${customDomain.Status}`);
    if (terminalStatus?.includes(customDomain.Status || "")) {
      return customDomain;
    } else if (!inProgressStatus.includes(customDomain.Status || "")) {
      logger(
        chalk.red(
          `failure adding custom domain: unexpected custom domain status ${customDomain.Status}`
        )
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

function getAutoScalingSettings(options: EnsureAppRunnerOptions) {
  return {
    MaxConcurrency: options.autoScaling.maxConcurrency,
    MaxSize: options.autoScaling.maxSize,
    MinSize: options.autoScaling.minSize,
  };
}

function getHealthCheckSettings(options: EnsureAppRunnerOptions) {
  return {
    Protocol: HealthCheckProtocol.HTTP,
    Path: options.healthCheck.path,
    Interval: options.healthCheck.interval,
    Timeout: options.healthCheck.timeout,
    HealthyThreshold: options.healthCheck.healthyThreshold,
    UnhealthyThreshold: options.healthCheck.unhealthyThreshold,
  };
}

export async function describeAutoScalingConfiguration(
  region: string,
  autoScalingConfigurationArn: string
): Promise<AutoScalingConfiguration> {
  const apprunner = getAppRunnerClient(region);
  const describeAutoScalingCommand =
    new DescribeAutoScalingConfigurationCommand({
      AutoScalingConfigurationArn: autoScalingConfigurationArn,
    });
  const autoScalingResponse = await apprunner.send(describeAutoScalingCommand);
  return autoScalingResponse.AutoScalingConfiguration as AutoScalingConfiguration;
}

export async function describeCustomDomains(
  region: string,
  serviceArn: string
): Promise<CustomDomain[]> {
  const apprunner = getAppRunnerClient(region);
  const command = new DescribeCustomDomainsCommand({
    ServiceArn: serviceArn,
  });
  const result = await apprunner.send(command);
  return result.CustomDomains || [];
}

export async function addCustomDomain(
  region: string,
  serviceArn: string,
  domain: string,
  www: boolean,
  silentOutput: boolean,
  logger: Logger
): Promise<CustomDomain> {
  const apprunner = getAppRunnerClient(region);
  const addCommand = new AssociateCustomDomainCommand({
    ServiceArn: serviceArn,
    DomainName: domain,
    EnableWWWSubdomain: www,
  });
  await apprunner.send(addCommand);
  const result = await waitForCustomDomain(
    region,
    serviceArn,
    MaxWaitTimeForCustomDomain,
    ["creating", "binding_certificate"],
    ["pending_certificate_dns_validation", "active"],
    silentOutput,
    logger
  );
  if (!result) {
    console.log(
      chalk.red(
        `The custom domain did not reach the expected state within ${MaxWaitTimeForCustomDomain} seconds`
      )
    );
    console.log(
      chalk.red(
        `You can continue manually checking the status of the custom domain in AWS or with 'yarn ops status'`
      )
    );
    process.exit(1);
  }
  return result;
}

export async function removeCustomDomain(
  region: string,
  serviceArn: string,
  domain: string,
  logger: Logger
): Promise<void> {
  const apprunner = getAppRunnerClient(region);
  const removeCommand = new DisassociateCustomDomainCommand({
    ServiceArn: serviceArn,
    DomainName: domain,
  });
  await apprunner.send(removeCommand);
}

export function getServiceUrlEnvironmentVariables(serviceUrls: ServiceUrls): {
  [key: string]: string;
} {
  return {
    [ConfigSettings.ApiAppRunnerUrl]: serviceUrls[ApiConfiguration.Name],
    [ConfigSettings.WebAppRunnerUrl]: serviceUrls[WebConfiguration.Name],
    [ConfigSettings.Auth0BaseUrl]: serviceUrls[WebConfiguration.Name],
  };
}

async function updateAppRunnerService(
  options: EnsureAppRunnerOptions,
  existingService: Service
): Promise<void> {
  const apprunner = getAppRunnerClient(options.region);
  const ecrRepositoryUrl = await getEcrRepositoryArn(
    options.region,
    options.ecrRepositoryName
  );
  const Tags = getTags(options.region, options.deployment, {
    [TagKeys.LetsGoComponent]: options.component,
  });

  // Clean up unsusued AutoScalingConfigurations to stay within the quota
  await deleteUnusedAutoScalingConfigurations(
    options.region,
    options.autoScalingConfigurationName,
    options.logger
  );

  // Create new AutoScalingConfiguration if needed
  const currentAutoScalingSettings: any =
    await describeAutoScalingConfiguration(
      options.region,
      existingService.AutoScalingConfigurationSummary
        ?.AutoScalingConfigurationArn || ""
    );
  const desiredAutoScalingSettings: any = getAutoScalingSettings(options);
  const autoScalingNeedsUpdate =
    ["MaxConcurrency", "MinSize", "MaxSize"].find(
      (setting) =>
        currentAutoScalingSettings[setting] !==
        desiredAutoScalingSettings[setting]
    ) !== undefined;
  let newAutoScalingConfigurationArn: string | undefined;
  if (autoScalingNeedsUpdate) {
    const createAutoScalingCommand = new CreateAutoScalingConfigurationCommand({
      AutoScalingConfigurationName: options.autoScalingConfigurationName,
      ...desiredAutoScalingSettings,
      Tags,
    });
    const autoScalingResult = await apprunner.send(createAutoScalingCommand);
    newAutoScalingConfigurationArn =
      autoScalingResult.AutoScalingConfiguration?.AutoScalingConfigurationArn;
  }

  // Check if health settings configuration needs to be updated
  const currentHealthCheckSettings: any =
    existingService.HealthCheckConfiguration || {};
  const desiredHealthCheckSettings: any = getHealthCheckSettings(options);
  const healthCheckNeedsUpdate =
    [
      "Path",
      "Interval",
      "Timeout",
      "HealthyThreshold",
      "UnhealthyThreshold",
    ].find(
      (setting) =>
        currentHealthCheckSettings[setting] !==
        desiredHealthCheckSettings[setting]
    ) !== undefined;

  // Check if instance configuration needs to be updated
  const instanceConfigurationNeedsUpdate =
    existingService.InstanceConfiguration?.Cpu !== options.appRunnerCpu ||
    existingService.InstanceConfiguration?.Memory !== options.appRunnerMemory;

  // Check if image needs to be updated
  const imageNeedsUpdate =
    (existingService.SourceConfiguration?.ImageRepository?.ImageIdentifier ||
      "") !== `${ecrRepositoryUrl}:${options.imageTag}`;

  // Check if config need to be updated
  const desiredServiceUrlEnvironmentVariables =
    getServiceUrlEnvironmentVariables(options.serviceUrls);
  const desiredServiceUrlEnvironmentVariablesKeys = Object.keys(
    desiredServiceUrlEnvironmentVariables
  );
  const desiredEnvironmentVariables =
    (await getConfig(options.region, options.deployment))[options.deployment] ||
    {};
  const desiredEnvironmentVariableKeys = Object.keys(
    desiredEnvironmentVariables
  );
  const currentEnvironmentVariables =
    existingService.SourceConfiguration?.ImageRepository?.ImageConfiguration
      ?.RuntimeEnvironmentVariables || {};
  const configNeedsUpdate =
    desiredEnvironmentVariableKeys.find(
      (key) =>
        currentEnvironmentVariables[key] !== desiredEnvironmentVariables[key] &&
        !options.ignoreConfigKeys.includes(key)
    ) !== undefined ||
    desiredServiceUrlEnvironmentVariablesKeys.find(
      (name) =>
        currentEnvironmentVariables[name] !==
        desiredServiceUrlEnvironmentVariables[name]
    ) !== undefined;

  // Update plan
  const updatePlan: string[] = [
    ...(newAutoScalingConfigurationArn ? ["autoscaling settings"] : []),
    ...(healthCheckNeedsUpdate ? ["healthcheck settings"] : []),
    ...(instanceConfigurationNeedsUpdate ? ["instance configuration"] : []),
    ...(imageNeedsUpdate ? ["image"] : []),
    ...(configNeedsUpdate ? ["variables"] : []),
  ];
  if (updatePlan.length > 0) {
    // Updating service
    options.logger(
      `updating ${options.component}: ${updatePlan.join(", ")}...`
    );
    const updatedAt = new Date().toISOString();
    const updateServiceCommand = new UpdateServiceCommand({
      ServiceArn: existingService.ServiceArn,
      ...(newAutoScalingConfigurationArn
        ? { AutoScalingConfigurationArn: newAutoScalingConfigurationArn }
        : {}),
      ...(healthCheckNeedsUpdate
        ? {
            HealthCheckConfiguration: {
              ...desiredHealthCheckSettings,
            },
          }
        : {}),
      ...(instanceConfigurationNeedsUpdate
        ? {
            InstanceConfiguration: {
              InstanceRoleArn: options.appRunnerInstanceRoleArn,
              Cpu: options.appRunnerCpu,
              Memory: options.appRunnerMemory,
            },
          }
        : {}),
      SourceConfiguration: {
        ImageRepository: {
          ImageIdentifier: `${ecrRepositoryUrl}:${options.imageTag}`,
          ImageRepositoryType: "ECR",
          ImageConfiguration: {
            RuntimeEnvironmentVariables: {
              LETSGO_IMAGE_TAG: options.imageTag,
              LETSGO_DEPLOYMENT: options.deployment,
              LETSGO_UPDATED_AT: updatedAt,
              // Workaround for a Next.js issue. See https://github.com/vercel/next.js/issues/49777
              HOSTNAME: "0.0.0.0",
              ...desiredServiceUrlEnvironmentVariables,
              ...desiredEnvironmentVariables,
            },
          },
        },
        AutoDeploymentsEnabled: false,
        AuthenticationConfiguration: {
          AccessRoleArn: options.appRunnerInstanceRoleArn,
        },
      },
    });
    await apprunner.send(updateServiceCommand);
    const tagResourceCommand = new TagResourceCommand({
      ResourceArn: existingService.ServiceArn,
      Tags: getTags(options.region, options.deployment, {
        [TagKeys.LetsGoComponent]: options.component,
      }),
    });
    await apprunner.send(tagResourceCommand);
    const service = await waitForAppRunnerService(
      options.region,
      options.component,
      existingService.ServiceArn || "",
      MaxWaitTimeForAppRunnerUpdate,
      "OPERATION_IN_PROGRESS",
      "RUNNING",
      options.logger
    );
    if (!service) {
      options.logger(
        chalk.red(
          `${options.component} was updated but did not reach the RUNNING state within ${MaxWaitTimeForAppRunnerUpdate} seconds`
        )
      );
      options.logger(
        chalk.red(
          `you can continue checking the status of the ${options.component} service at https://${existingService.ServiceUrl}`
        )
      );
      process.exit(1);
    }
    if (
      service.SourceConfiguration?.ImageRepository?.ImageConfiguration
        ?.RuntimeEnvironmentVariables?.LETSGO_UPDATED_AT !== updatedAt
    ) {
      options.logger(
        chalk.red(
          `${options.component} update failed and the deployment was rolled back to the previous version`
        )
      );
      options.logger(
        chalk.red(
          `check the AWS App Runner application logs in AWS for more information`
        )
      );
      process.exit(1);
    }
  }
  options.logger(
    `${options.component} is up to date at ${chalk.green(
      `https://${existingService.ServiceUrl}`
    )}`
  );
}

async function createAppRunnerService(
  options: EnsureAppRunnerOptions
): Promise<Service> {
  const apprunner = getAppRunnerClient(options.region);
  const ecrRepositoryUrl = await getEcrRepositoryArn(
    options.region,
    options.ecrRepositoryName
  );
  const Tags = getTags(options.region, options.deployment, {
    [TagKeys.LetsGoComponent]: options.component,
  });

  // Clean up unsusued AutoScalingConfigurations to stay within the quota
  await deleteUnusedAutoScalingConfigurations(
    options.region,
    options.autoScalingConfigurationName,
    options.logger
  );

  // Create AutoScalingConfiguration
  options.logger(
    `creating AutoScalingConfiguration ${options.autoScalingConfigurationName}...`
  );
  const createAutoScalingCommand = new CreateAutoScalingConfigurationCommand({
    AutoScalingConfigurationName: options.autoScalingConfigurationName,
    ...getAutoScalingSettings(options),
    Tags,
  });
  const autoScalingResult = await apprunner.send(createAutoScalingCommand);

  // Create AppRunner Service
  options.logger(`creating ${options.component} service...`);
  const desiredServiceUrlEnvironmentVariables =
    getServiceUrlEnvironmentVariables(options.serviceUrls);
  const createServiceCommand = new CreateServiceCommand({
    ServiceName: options.appRunnerServiceName,
    SourceConfiguration: {
      ImageRepository: {
        ImageIdentifier: `${ecrRepositoryUrl}:${options.imageTag}`,
        ImageRepositoryType: "ECR",
        ImageConfiguration: {
          RuntimeEnvironmentVariables: {
            LETSGO_IMAGE_TAG: options.imageTag,
            LETSGO_DEPLOYMENT: options.deployment,
            LETSGO_UPDATED_AT: new Date().toISOString(),
            // Workaround for a Next.js issue. See https://github.com/vercel/next.js/issues/49777
            HOSTNAME: "0.0.0.0",
            ...desiredServiceUrlEnvironmentVariables,
            ...((await getConfig(options.region, options.deployment))[
              options.deployment
            ] || {}),
          },
        },
      },
      AutoDeploymentsEnabled: false,
      AuthenticationConfiguration: {
        AccessRoleArn: options.appRunnerInstanceRoleArn,
      },
    },
    InstanceConfiguration: {
      InstanceRoleArn: options.appRunnerInstanceRoleArn,
      Cpu: options.appRunnerCpu,
      Memory: options.appRunnerMemory,
    },
    Tags,
    HealthCheckConfiguration: {
      ...getHealthCheckSettings(options),
    },
    ...{
      AutoScalingConfigurationArn:
        autoScalingResult.AutoScalingConfiguration?.AutoScalingConfigurationArn,
    },
    NetworkConfiguration: {
      IngressConfiguration: {
        IsPubliclyAccessible: true,
      },
    },
  });
  const createServiceResult = await apprunner.send(createServiceCommand);
  const service = await waitForAppRunnerService(
    options.region,
    options.component,
    createServiceResult.Service?.ServiceArn || "",
    MaxWaitTimeForAppRunnerCreate,
    "OPERATION_IN_PROGRESS",
    "RUNNING",
    options.logger
  );
  if (service) {
    options.logger(
      `${options.component} created at ${chalk.green(
        `https://${service?.ServiceUrl}`
      )}`
    );
  } else {
    options.logger(
      chalk.red(
        `${options.component} was created but did not reach the RUNNING state within ${MaxWaitTimeForAppRunnerCreate} seconds. `
      )
    );
    options.logger(
      chalk.red(
        `you can continue checking the status of the ${options.component} service at https://${createServiceResult.Service?.ServiceUrl}`
      )
    );
    process.exit(1);
  }
  return service;
}

export async function deleteAppRunnerService(
  region: string,
  component: string,
  serviceArn: string,
  logger: Logger
): Promise<void> {
  const apprunner = getAppRunnerClient(region);
  const deleteServiceCommand = new DeleteServiceCommand({
    ServiceArn: serviceArn,
  });
  logger(`deleting service ${serviceArn}...`);
  try {
    await apprunner.send(deleteServiceCommand);
  } catch (e: any) {
    if (e.name === "InvalidStateException") {
      logger(chalk.red(e.message));
      process.exit(1);
    }
    if (e.name !== "ResourceNotFoundException") {
      throw e;
    }
    return;
  }
  const service = await waitForAppRunnerService(
    region,
    component,
    serviceArn,
    MaxWaitTimeForAppRunnerUpdate,
    "OPERATION_IN_PROGRESS",
    "DELETED",
    logger
  );
  if (service) {
    logger(
      chalk.red(
        `service ${serviceArn} was deleted but did not reach the DELETED state within ${MaxWaitTimeForAppRunnerUpdate} seconds. `
      )
    );
    process.exit(1);
  }
}

export interface ServiceSummaryWithTags extends ServiceSummary {
  Tags?: Tag[];
}

export async function listLetsGoAppRunnerServices(
  region: string,
  deployment?: string,
  component?: string
): Promise<ServiceSummaryWithTags[]> {
  const apprunner = getAppRunnerClient(region);
  const listInput: ListServicesCommandInput = {};
  const services: ServiceSummaryWithTags[] = [];
  while (true) {
    const result = await apprunner.send(new ListServicesCommand(listInput));
    for (const service of result.ServiceSummaryList || []) {
      if (service.ServiceName?.startsWith(`${VendorPrefix}-`)) {
        const listTagsCommand = new ListTagsForResourceCommand({
          ResourceArn: service.ServiceArn || "",
        });
        const tagsResult = await apprunner.send(listTagsCommand);
        const deploymentValue = tagsResult.Tags?.find(
          (tag) => tag.Key === TagKeys.LetsGoDeployment
        )?.Value;
        const componentValue = tagsResult.Tags?.find(
          (tag) => tag.Key === TagKeys.LetsGoComponent
        )?.Value;
        if (
          deploymentValue &&
          componentValue &&
          (!deployment || deployment === deploymentValue) &&
          (!component || component === componentValue)
        ) {
          services.push({ ...service, Tags: tagsResult.Tags });
        }
      }
    }
    if (!result.NextToken) {
      break;
    }
    listInput.NextToken = result.NextToken;
  }
  return services;
}

async function getOneLetsGoAppRunnerService(
  region: string,
  deployment: string,
  component: string,
  logger: Logger
): Promise<ServiceSummary | undefined> {
  logger(`discovering ${component} services...`);
  let existingServices = await listLetsGoAppRunnerServices(
    region,
    deployment,
    component
  );
  if (existingServices.length > 1) {
    logger(
      chalk.red(`found multiple ${component} services, and expected only one:`)
    );
    existingServices.forEach((service) =>
      logger(chalk.red(`  ${service.ServiceArn} (${service.ServiceUrl})`))
    );
    logger(
      chalk.red(
        `manually resolve this issue by deleting the ${component} services you don't need in AWS, then try again`
      )
    );
    process.exit(1);
  }
  if (existingServices.length === 0) {
    logger(`existing ${component} service not found`);
    return undefined;
  }
  logger(
    `found ${component} service https://${existingServices[0]?.ServiceUrl}`
  );
  return existingServices[0];
}

export async function ensureAppRunner(
  options: EnsureAppRunnerOptions
): Promise<void> {
  let existingServiceSummary = await getOneLetsGoAppRunnerService(
    options.region,
    options.deployment,
    options.component,
    options.logger
  );
  if (existingServiceSummary?.Status === "OPERATION_IN_PROGRESS") {
    options.logger(
      chalk.red(
        `the ${options.component} service is currently being updated, please try again later`
      )
    );
    process.exit(1);
  }

  if (existingServiceSummary?.Status === "CREATE_FAILED") {
    await deleteAppRunnerService(
      options.region,
      options.component,
      existingServiceSummary.ServiceArn || "",
      options.logger
    );
    existingServiceSummary = undefined;
  }

  let existingService =
    existingServiceSummary &&
    (await describeService(options.region, existingServiceSummary.ServiceArn));

  if (!existingService || existingServiceSummary?.Status === "DELETED") {
    existingService = await createAppRunnerService(options);
  } else {
    await updateAppRunnerService(options, existingService);
  }
  await setLogGroupRetentionPolicy(
    options.region,
    `/aws/apprunner/${existingService.ServiceName}/${existingService.ServiceId}/application`,
    options.logRetentionInDays
  );
  await setLogGroupRetentionPolicy(
    options.region,
    `/aws/apprunner/${existingService.ServiceName}/${existingService.ServiceId}/service`,
    options.logRetentionInDays
  );
}
