import {
  SSMClient,
  GetParametersByPathCommand,
  PutParameterCommand,
  DeleteParameterCommand,
  DeleteParametersCommand,
  AddTagsToResourceCommand,
  GetParameterCommand,
} from "@aws-sdk/client-ssm";
import { ConfigPrefix, getTags } from "./defaults";
import { DefaultConfig } from "@letsgo/constants";
const apiVersion = "2014-11-06";

export interface LetsGoDeploymentConfig {
  [key: string]: string;
}

export interface LetsGoConfig {
  [deployment: string]: LetsGoDeploymentConfig;
}

export type SetConfigValueCallback = (value: string) => Promise<void>;

function getSSMClient(region: string) {
  return new SSMClient({
    apiVersion,
    region,
  });
}

const getConfigKey = (deployment?: string, key?: string) =>
  `${ConfigPrefix}${
    (deployment && `/${deployment}${(key && `/${key}`) || ""}`) || ""
  }`;

async function retry<T>(handler: () => Promise<T>): Promise<T> {
  let delay = 1000;
  let result: T | undefined = undefined;
  while (delay > 0 && delay <= 8000) {
    try {
      result = await handler();
      delay = 0;
    } catch (e: any) {
      if (e.name !== "ThrottlingException") {
        throw e;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  if (!result) {
    throw new Error(
      `Exceeded the maximum number of retries to address throttling.`
    );
  }
  return result;
}

export async function getConfig(
  region: string,
  deployment?: string,
  arns?: boolean
): Promise<LetsGoConfig> {
  const ssm = getSSMClient(region);
  // Get all parameters, optionally filtered down to the specified region and deployment
  const Path = getConfigKey(deployment);
  const allParams = [];
  let result;
  do {
    const command: GetParametersByPathCommand = new GetParametersByPathCommand({
      Path,
      Recursive: true,
      WithDecryption: true,
      NextToken: result && result.NextToken,
    });
    result = await retry(() => ssm.send(command));
    allParams.push(...(result?.Parameters || []));
  } while (result?.NextToken);

  // Reduce the parameters into a single object
  const config: LetsGoConfig = {};
  allParams.forEach((param) => {
    const [_, __, deployment, key] = (param.Name || "").split("/");
    if (region && deployment && key) {
      config[deployment] = config[deployment] || {};
      config[deployment][key] = (arns ? param.ARN : param.Value) || "";
    }
  });

  return config;
}

export async function setConfig(
  region: string,
  deployment: string,
  kvs: { [key: string]: string }
): Promise<void> {
  const ssm = getSSMClient(region);
  // Set the parameters
  const Tags = getTags(region, deployment);
  for (const key of Object.keys(kvs)) {
    if (kvs[key] && kvs[key].length > 0) {
      const Name = getConfigKey(deployment, key);
      const command = new PutParameterCommand({
        Name,
        Type: "SecureString",
        Value: kvs[key],
        Overwrite: true,
      });
      await retry(() => ssm.send(command));
      const addTagsToResourceCommand = new AddTagsToResourceCommand({
        ResourceId: Name,
        ResourceType: "Parameter",
        Tags,
      });
      await retry(() => ssm.send(addTagsToResourceCommand));
    } else {
      const command = new DeleteParameterCommand({
        Name: getConfigKey(deployment, key),
      });
      try {
        await retry(() => ssm.send(command));
      } catch (e: any) {
        // Ignore if the parameter doesn't exist
        if (e.name !== "ParameterNotFound") {
          throw e;
        }
      }
    }
  }
}

export async function setConfigValue(
  region: string,
  deployment: string,
  key: string,
  value: string
): Promise<void> {
  // Set a single configuration value
  await setConfig(region, deployment, { [key]: value });
}

export async function getConfigValue(
  region: string,
  deployment: string,
  key: string,
  defaultValue?: string
): Promise<string | undefined> {
  const ssm = getSSMClient(region);
  // Get a single configuration value
  const command = new GetParameterCommand({
    Name: getConfigKey(deployment, key),
    WithDecryption: true,
  });
  try {
    const result = await retry(() => ssm.send(command));
    return result.Parameter?.Value || defaultValue;
  } catch (e: any) {
    if (e.name !== "ParameterNotFound") {
      throw e;
    }
    return defaultValue;
  }
}

export async function deleteConfig(
  region: string,
  deployment: string
): Promise<string[]> {
  const ssm = getSSMClient(region);
  // Delete all configuration parameters for the specified deployment
  const config = await getConfig(deployment);
  const AllNames: string[] = Object.keys(config[deployment] || {}).map((key) =>
    getConfigKey(deployment, key)
  );
  const deletedParameters: string[] = [];
  while (AllNames.length > 0) {
    const Names = AllNames.splice(0, 10);
    const command = new DeleteParametersCommand({ Names });
    const result = await ssm.send(command);
    deletedParameters.push(...(result.DeletedParameters || []));
  }
  return deletedParameters;
}

export async function ensureDefaultConfig(
  region: string,
  deployment: string,
  defaultConfig: DefaultConfig
): Promise<LetsGoDeploymentConfig> {
  // Read config from SSM for the deployment and then write back default values for any missing keys.
  // Return the full deployment config.
  const existingConfig =
    (await getConfig(region, deployment))[deployment] || {};
  const newConfigSettings = Object.entries(defaultConfig).reduce(
    (acc, entry) => {
      const [_, [key, value]] = entry;
      if (existingConfig[key] === undefined) {
        existingConfig[key] = acc[key] = value;
      }
      return acc;
    },
    {} as LetsGoDeploymentConfig
  );
  await setConfig(region, deployment, newConfigSettings);
  return existingConfig;
}
