export const VendorPrefix = "letsgo";
export const ConfigRegion = "us-west-2";
export const DefaultRegion = process.env.AWS_REGION || "us-west-2";
export const DefaultDeployment = "main";

export const ConfigSettings = {
  ApiAppRunnerUrl: "LETSGO_API_URL",
  ApiAppRunnerMinSize: "LETSGO_API_APPRUNNER_MIN_SIZE",
  ApiAppRunnerMaxSize: "LETSGO_API_APPRUNNER_MAX_SIZE",
  ApiAppRunnerMaxConcurrency: "LETSGO_API_APPRUNNER_MAX_CONCURRENCY",
  ApiAppRunnerCpu: "LETSGO_API_APPRUNNER_CPU",
  ApiAppRunnerMemory: "LETSGO_API_APPRUNNER_MEMORY",
  ApiAppRunnerHealthPath: "LETSGO_API_APPRUNNER_HEALTH_PATH",
  ApiAppRunnerHealthTimeout: "LETSGO_API_APPRUNNER_HEALTH_TIMEOUT",
  ApiAppRunnerHealthInterval: "LETSGO_API_APPRUNNER_HEALTH_INTERVAL",
  ApiAppRunnerHealthHealthyThreshold:
    "LETSGO_API_APPRUNNER_HEALTH_HEALTHY_THRESHOLD",
  ApiAppRunnerHealthUnhealthyThreshold:
    "LETSGO_API_APPRUNNER_HEALTH_UNHEALTHY_THRESHOLD",
  WebAppRunnerUrl: "LETSGO_WEB_URL",
  WebAppRunnerMinSize: "LETSGO_WEB_APPRUNNER_MIN_SIZE",
  WebAppRunnerMaxSize: "LETSGO_WEB_APPRUNNER_MAX_SIZE",
  WebAppRunnerMaxConcurrency: "LETSGO_WEB_APPRUNNER_MAX_CONCURRENCY",
  WebAppRunnerCpu: "LETSGO_WEB_APPRUNNER_CPU",
  WebAppRunnerMemory: "LETSGO_WEB_APPRUNNER_MEMORY",
  WebAppRunnerHealthPath: "LETSGO_WEB_APPRUNNER_HEALTH_PATH",
  WebAppRunnerHealthTimeout: "LETSGO_WEB_APPRUNNER_HEALTH_TIMEOUT",
  WebAppRunnerHealthInterval: "LETSGO_WEB_APPRUNNER_HEALTH_INTERVAL",
  WebAppRunnerHealthHealthyThreshold:
    "LETSGO_WEB_APPRUNNER_HEALTH_HEALTHY_THRESHOLD",
  WebAppRunnerHealthUnhealthyThreshold:
    "LETSGO_WEB_APPRUNNER_HEALTH_UNHEALTHY_THRESHOLD",
};

export interface AppRunnerSettingsDefaultConfig {
  minSize: string[];
  maxSize: string[];
  maxConcurrency: string[];
  cpu: string[];
  memory: string[];
  healthPath: string[];
  healthInterval: string[];
  healthTimeout: string[];
  healthHealthyThreshold: string[];
  healthUnhealthyThreshold: string[];
}

export interface AppRunnerSettings {
  Name: string;
  getRoleName: (region: string, deployment: string) => string;
  getPolicyName: (region: string, deployment: string) => string;
  getInlineRolePolicy: (
    accountId: string,
    region: string,
    deployment: string
  ) => object;
  getEcrRepositoryName: (deployment: string) => string;
  getLocalRepositoryName: (deployment: string) => string;
  getAppRunnerServiceName: (deployment: string) => string;
  getAppRunnerAutoScalingConfigurationName: (deployment: string) => string;
  serviceUrlConfigKey: string;
  defaultConfig: AppRunnerSettingsDefaultConfig;
}

const createAppRunnerConfiguration = (componentName: string) => ({
  Name: componentName,
  getRoleName: (region: string, deployment: string) =>
    `${VendorPrefix}-${region}-${deployment}-${componentName}`,
  getPolicyName: (region: string, deployment: string) =>
    `${VendorPrefix}-${region}-${deployment}-${componentName}`,
  getInlineRolePolicy: (
    accountId: string,
    region: string,
    deployment: string
  ) => ({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["ssm:GetParameters"],
        Resource: [
          `arn:aws:ssm:${region}:${accountId}:parameter/${VendorPrefix}/${region}/${deployment}/*`,
        ],
      },
      {
        Effect: "Allow",
        Action: [
          "ecr:BatchGetImage",
          "ecr:DescribeImages",
          "ecr:GetDownloadUrlForLayer",
        ],
        Resource: [
          `arn:aws:ecr:${region}:${accountId}:repository/${VendorPrefix}-${deployment}-${componentName}`,
        ],
      },
      {
        Effect: "Allow",
        Action: ["ecr:GetAuthorizationToken"],
        Resource: "*",
      },
    ],
  }),
  getEcrRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${componentName}`,
  getLocalRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${componentName}`,
  getAppRunnerServiceName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${componentName}`,
  getAppRunnerAutoScalingConfigurationName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${componentName}`,
});

export const ApiConfiguration: AppRunnerSettings = {
  ...createAppRunnerConfiguration("api"),
  serviceUrlConfigKey: ConfigSettings.ApiAppRunnerUrl,
  defaultConfig: {
    minSize: [ConfigSettings.ApiAppRunnerMinSize, "1"],
    maxSize: [ConfigSettings.ApiAppRunnerMaxSize, "10"],
    maxConcurrency: [ConfigSettings.ApiAppRunnerMaxConcurrency, "100"],
    cpu: [ConfigSettings.ApiAppRunnerCpu, "1024"],
    memory: [ConfigSettings.ApiAppRunnerMemory, "2048"],
    healthPath: [ConfigSettings.ApiAppRunnerHealthPath, "/v1/health"],
    healthInterval: [ConfigSettings.ApiAppRunnerHealthInterval, "5"],
    healthTimeout: [ConfigSettings.ApiAppRunnerHealthTimeout, "2"],
    healthHealthyThreshold: [
      ConfigSettings.ApiAppRunnerHealthHealthyThreshold,
      "1",
    ],
    healthUnhealthyThreshold: [
      ConfigSettings.ApiAppRunnerHealthUnhealthyThreshold,
      "5",
    ],
  },
};

export const WebConfiguration: AppRunnerSettings = {
  ...createAppRunnerConfiguration("web"),
  serviceUrlConfigKey: ConfigSettings.WebAppRunnerUrl,
  defaultConfig: {
    minSize: [ConfigSettings.WebAppRunnerMinSize, "1"],
    maxSize: [ConfigSettings.WebAppRunnerMaxSize, "10"],
    maxConcurrency: [ConfigSettings.WebAppRunnerMaxConcurrency, "100"],
    cpu: [ConfigSettings.WebAppRunnerCpu, "1024"],
    memory: [ConfigSettings.WebAppRunnerMemory, "2048"],
    healthPath: [ConfigSettings.WebAppRunnerHealthPath, "/"],
    healthInterval: [ConfigSettings.WebAppRunnerHealthInterval, "5"],
    healthTimeout: [ConfigSettings.WebAppRunnerHealthTimeout, "2"],
    healthHealthyThreshold: [
      ConfigSettings.WebAppRunnerHealthHealthyThreshold,
      "1",
    ],
    healthUnhealthyThreshold: [
      ConfigSettings.WebAppRunnerHealthUnhealthyThreshold,
      "5",
    ],
  },
};

export interface DBSettings {
  getTableName: (deployment: string) => string;
}

export const DBConfiguration: DBSettings = {
  getTableName: (deployment: string) => `${VendorPrefix}-${deployment}`,
};
