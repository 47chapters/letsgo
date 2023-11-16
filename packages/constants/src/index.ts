/**
 * The package defines constants that change infrequently:
 * - naming patterns of AWS resources created by LetsGo,
 * - IAM policies for the components created by LetsGo,
 * - default values for configuration settings,
 * - other infrequently changing configuration values.
 *
 * @module
 */

import { randomBytes } from "crypto";

/**
 * The prefix of the name of all AWS resources created by LetsGo. You may want to change it to something
 * unique to your organization or application. However, you can only do so _before_ you create your first deployment.
 * Changing this value once the artifacts had been deployed is not supported.
 */
export const VendorPrefix = "letsgo";

/**
 * The default AWS region used by LetsGo CLI commands.
 */
export const DefaultRegion = process.env.AWS_REGION || "us-west-2";

/**
 * The default LetsGo deployment name used by LetsGo CLI commands.
 */
export const DefaultDeployment = process.env.LETSGO_DEPLOYMENT || "main";

/**
 * The default OAuth `audience` value expected in the access tokens, as well as the default `audience` value
 * used when creating JWTs using the built-in PKI issuer.
 */
export const StaticJwtAudience = `${VendorPrefix}:service`;

/**
 * Default validity period of the invitations to join a tenant.
 */
export const InvitationTtl = 60 * 60 * 24; // 24h

/**
 * Default version of of Stripe APIs called and Stripe webhooks accepted.
 */
export const StripeApiVersion = "2023-10-16";

/**
 * The name of the Stripe metadata tag that contains the LetsGo tenant ID added to Stripe subscriptions.
 */
export const StripeTenantIdMetadataKey = `${VendorPrefix}-tenantId`;

/**
 * The name of the Stripe metadata tag that contains the LetsGo identity ID added to Stripe subscriptions.
 */
export const StripeIdentityIdMetadataKey = `${VendorPrefix}-identityId`;

/**
 * The name of the Stripe metadata tag that contains the LetsGo plan ID added to Stripe subscriptions.
 */
export const StripePlanIdMetadataKey = `${VendorPrefix}-planId`;

/**
 * Names of AWS tags added to all AWS resources created by LetsGo.
 */
export const TagKeys = {
  LetsGoVersion: "LetsGoVersion",
  LetsGoDeployment: "LetsGoDeployment",
  LetsGoRegion: "LetsGoRegion",
  LetsGoUpdated: "LetsGoUpdated",
  LetsGoComponent: "LetsGoComponent",
};

/**
 * Names of environment variables regognized by LetsGo components which contain
 * configuration settings controling.
 */
export const ConfigSettings = {
  /**
   * The OAuth `audience` value expected in the access tokens used to access the HTTP API.
   */
  ApiAppRunnerAudience: "LETSGO_API_AUDIENCE",
  /**
   * Public URL of the _API_ component.
   */
  ApiAppRunnerUrl: "LETSGO_API_URL",
  /**
   * The minimum number of instances of the _API_ component to keep running at all times.
   */
  ApiAppRunnerMinSize: "LETSGO_API_APPRUNNER_MIN_SIZE",
  /**
   * The maxium number of instances of the _API_ component.
   */
  ApiAppRunnerMaxSize: "LETSGO_API_APPRUNNER_MAX_SIZE",
  /**
   * The maximum number of concurrent HTTP requests processed by a single instance of the _API_ component.
   */
  ApiAppRunnerMaxConcurrency: "LETSGO_API_APPRUNNER_MAX_CONCURRENCY",
  /**
   * The amount of CPU allocated to a single instance of the _API_ component.
   */
  ApiAppRunnerCpu: "LETSGO_API_APPRUNNER_CPU",
  /**
   * The amount of memory allocated to a single instance of the _API_ component.
   */
  ApiAppRunnerMemory: "LETSGO_API_APPRUNNER_MEMORY",
  /**
   * The path of the HTTP endpoint used by the App Runner health check to determine
   * if the instance of the _API_ component is healthy.
   */
  ApiAppRunnerHealthPath: "LETSGO_API_APPRUNNER_HEALTH_PATH",
  /**
   * The maximum time in seconds the App Runner healh check for the _API component can take before
   * it is considered failed.
   */
  ApiAppRunnerHealthTimeout: "LETSGO_API_APPRUNNER_HEALTH_TIMEOUT",
  /**
   * Frequency in seconds of the App Runner health check for the _API_ component.
   */
  ApiAppRunnerHealthInterval: "LETSGO_API_APPRUNNER_HEALTH_INTERVAL",
  /**
   * The number of consecutive successful health checks before the instance of the _API_ component is considered healthy.
   */
  ApiAppRunnerHealthHealthyThreshold:
    "LETSGO_API_APPRUNNER_HEALTH_HEALTHY_THRESHOLD",
  /**
   * The number of consecutive failed health checks before the instance of the _API_ component is considered unhealthy.
   */
  ApiAppRunnerHealthUnhealthyThreshold:
    "LETSGO_API_APPRUNNER_HEALTH_UNHEALTHY_THRESHOLD",
  /**
   * The public URL of the _Web_ component.
   */
  WebAppRunnerUrl: "LETSGO_WEB_URL",
  /**
   * The minimum number of instances of the _web_ component to keep running at all times.
   */
  WebAppRunnerMinSize: "LETSGO_WEB_APPRUNNER_MIN_SIZE",
  /**
   * The maxium number of instances of the _web_ component.
   */
  WebAppRunnerMaxSize: "LETSGO_WEB_APPRUNNER_MAX_SIZE",
  /**
   * The maximum number of concurrent HTTP requests processed by a single instance of the _web_ component.
   */
  WebAppRunnerMaxConcurrency: "LETSGO_WEB_APPRUNNER_MAX_CONCURRENCY",
  /**
   * The amount of CPU allocated to a single instance of the _web_ component.
   */
  WebAppRunnerCpu: "LETSGO_WEB_APPRUNNER_CPU",
  /**
   * The amount of memory allocated to a single instance of the _web_ component.
   */
  WebAppRunnerMemory: "LETSGO_WEB_APPRUNNER_MEMORY",
  /**
   * The path of the HTTP endpoint used by the App Runner health check to determine
   * if the instance of the _web_ component is healthy.
   */
  WebAppRunnerHealthPath: "LETSGO_WEB_APPRUNNER_HEALTH_PATH",
  /**
   * The maximum time in seconds the App Runner healh check for the _web_ component can take before
   * it is considered failed.
   */
  WebAppRunnerHealthTimeout: "LETSGO_WEB_APPRUNNER_HEALTH_TIMEOUT",
  /**
   * Frequency in seconds of the App Runner health check for the _web_ component.
   */
  WebAppRunnerHealthInterval: "LETSGO_WEB_APPRUNNER_HEALTH_INTERVAL",
  /**
   * The number of consecutive successful health checks before the instance of the _web_ component is considered healthy.
   */
  WebAppRunnerHealthHealthyThreshold:
    "LETSGO_WEB_APPRUNNER_HEALTH_HEALTHY_THRESHOLD",
  /**
   * The number of consecutive failed health checks before the instance of the _web_ component is considered unhealthy.
   */
  WebAppRunnerHealthUnhealthyThreshold:
    "LETSGO_WEB_APPRUNNER_HEALTH_UNHEALTHY_THRESHOLD",
  /**
   * The maximum time in seconds an unconsumed message can stay in the SQS queue of the _worker_ component
   * before it is discarded.
   */
  WorkerMessageRetentionPeriod: "LETSGO_WORKER_MESSAGE_RETENTION_PERIOD",
  /**
   * The time in seconds a message remains invisible in the SQS queue of the _worker_ component if it did not
   * confirm its processing.
   */
  WorkerVisibilityTimeout: "LETSGO_WORKER_VISIBILITY_TIMEOUT",
  /**
   * The time in seconds a request for a message from the SQS queue remains pending if no message is available to read.
   */
  WorkerReceiveMessageWaitTime: "LETSGO_WORKER_RECEIVE_MESSAGE_WAIT_TIME",
  /**
   * The maximum number of messages the _worker_ component can process in a single invocation of the Lambda function.
   */
  WorkerBatchSize: "LETSGO_WORKER_BATCH_SIZE",
  /**
   * The maximum time in seconds the _worker_ component waits for more messages to arrive before processing the batch.
   */
  WorkerBatchingWindow: "LETSGO_WORKER_BATCHING_WINDOW",
  /**
   * The maximum number of concurrent instances of the _worker_ component. This number multipled by the {@link WorkerBatchSize}
   * is the upper bound on the number of concurrently processed messages.
   */
  WorkerCuncurrency: "LETSGO_WORKER_CONCURRENCY",
  /**
   * The maximum time in seconds the Lambda function of the _worker_ component can run before it is terminated.
   */
  WorkerFunctionTimeout: "LETSGO_WORKER_FUNCTION_TIMEOUT",
  /**
   * The amount of memory allocated to the Lambda function of the _worker_ component.
   */
  WorkerFunctionMemory: "LETSGO_WORKER_MEMORY",
  /**
   * The amount of ephemeral storage allocated to the Lambda function of the _worker_ component, available
   * in the `/tmp` directory.
   */
  WorkerFunctionEphemeralStorage: "LETSGO_WORKER_EPHEMERAL_STORAGE",
  /**
   * A secret used to encrypt the Auth0 cookie used by the _web_ component to represent a logged in user.
   */
  Auth0Secret: "AUTH0_SECRET",
  /**
   * The base URL of the _web_ component Auth0 uses to redirect the user to after completed authentication.
   */
  Auth0BaseUrl: "AUTH0_BASE_URL",
  /**
   * The base URL of the Auth0 tenant used by the _web_ component to authenticate users.
   */
  Auth0IssuerBaseUrl: "AUTH0_ISSUER_BASE_URL",
  /**
   * The OAuth client ID of the Auth0 application used by the _web_ component to authenticate users.
   */
  Auth0ClientId: "AUTH0_CLIENT_ID",
  /**
   * The OAuth client secret of the Auth0 application used by the _web_ component to authenticate users.
   */
  Auth0ClientSecret: "AUTH0_CLIENT_SECRET",
  /**
   * The OAuth `audience` value expected in the access tokens used to access the _web_ component.
   */
  Auth0Audience: "AUTH0_AUDIENCE",
  /**
   * The OAuth `scope` value requested from Auth0 when initiating the login transaction.
   */
  Auth0Scope: "AUTH0_SCOPE",
  /**
   * Determines if the Stripe live or test mode us used. Any value other than `1` means the test mode is used.
   */
  StripeLiveMode: "LETSGO_STRIPE_LIVE_MODE",
  /**
   * The Stripe public key used by LetsGo when running in test mode.
   */
  StripeTestPublicKey: "LETSGO_STRIPE_TEST_PUBLIC_KEY",
  /**
   * The Stripe secret key used by LetsGo when running in test mode.
   */
  StripeTestSecretKey: "LETSGO_STRIPE_TEST_SECRET_KEY",
  /**
   * The Stripe webhook secret used by LetsGo when running in test mode.
   */
  StripeTestWebhookKey: "LETSGO_STRIPE_TEST_WEBHOOK_KEY",
  /**
   * The Stripe public key used by LetsGo when running in live mode.
   */
  StripeLivePublicKey: "LETSGO_STRIPE_LIVE_PUBLIC_KEY",
  /**
   * The Stripe secret key used by LetsGo when running in live mode.
   */
  StripeLiveSecretKey: "LETSGO_STRIPE_LIVE_SECRET_KEY",
  /**
   * The Stripe webhook secret used by LetsGo when running in live mode.
   */
  StripeLiveWebhookKey: "LETSGO_STRIPE_LIVE_WEBHOOK_KEY",
  /**
   * The Slack incoming webhook URL used by LetsGo to send notifications.
   */
  SlackUrl: "LETSGO_SLACK_URL",
};

/**
 * A collection of default configuration settings. Each setting is an array of two strings: the first one
 * is the name of the environment variable representing this setting, and the seond is the default value of the setting.
 */
export interface DefaultConfig {
  [key: string]: string[];
}

/**
 * The collection of default configuration settings common to the _web_ and _API_ components.
 */
export interface AppRunnerSettingsDefaultConfig extends DefaultConfig {
  /**
   * The minimum number of instances of the component to keep running at all times.
   */
  minSize: string[];
  /**
   * The maxium number of instances of the component.
   */
  maxSize: string[];
  /**
   * The maximum number of concurrent HTTP requests processed by a single instance of the component.
   */
  maxConcurrency: string[];
  /**
   * The amount of CPU allocated to a single instance of the component.
   */
  cpu: string[];
  /**
   * The amount of memory allocated to a single instance of the component.
   */
  memory: string[];
  /**
   * The path of the HTTP endpoint used by the App Runner health check to determine
   * if the instance of the component is healthy.
   */
  healthPath: string[];
  /**
   * Frequency in seconds of the App Runner health check for the component.
   */
  healthInterval: string[];
  /**
   * The maximum time in seconds the App Runner healh check for the component can take before
   * it is considered failed.
   */
  healthTimeout: string[];
  /**
   * The number of consecutive successful health checks before the instance of the component is considered healthy.
   */
  healthHealthyThreshold: string[];
  /**
   * The number of consecutive failed health checks before the instance of the component is considered unhealthy.
   */
  healthUnhealthyThreshold: string[];
}

/**
 * Parameters that control the creation of an App Runner service and related AWS resources.
 */
export interface AppRunnerSettings {
  /**
   * The name of the component for which an AppRunner service is created (`web` or `api`).
   */
  Name: string;
  /**
   * Returns the name of the IAM role to create for the the App Runner service.
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns IAM role name
   */
  getRoleName: (region: string, deployment: string) => string;
  /**
   * Returns the name of the IAM policy to create for the the App Runner service.
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns IAM policy name
   */
  getPolicyName: (region: string, deployment: string) => string;
  /**
   * Returns a JavaScript object describing the inline IAM policy that will be included in the IAM role
   * created for the AppRunner service.
   * @param accountId AWS account ID
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns IAM inline policy document
   */
  getInlineRolePolicy: (
    accountId: string,
    region: string,
    deployment: string
  ) => object;
  /**
   * Returns an array of ARNs of managed IAM policies to attach to the IAM role created for the AppRunner service.
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns Array of managed IAM policy ARNs
   */
  getManagedPolicyArns: (region: string, deployment: string) => string[];
  /**
   * Returns the name of the ECR repository to create to store the Docker images for the AppRunner service.
   * @param deployment LetsGo deployment name
   * @returns ECR repository name
   */
  getEcrRepositoryName: (deployment: string) => string;
  /**
   * Returns the name of the locally built Docker image containing code for the component to be deployed.
   * @param deployment LetsGo deployment name
   * @returns Local Docker image name (without the tag)
   */
  getLocalRepositoryName: (deployment: string) => string;
  /**
   * Returns the name of the AppRunner service to create.
   * @param deployment LetsGo deployment name
   * @returns AppRunner service name
   */
  getAppRunnerServiceName: (deployment: string) => string;
  /**
   * Returns the name of the AppRunner auto scaling configuration to create.
   * @param deployment LetsGo deployment name
   * @returns AppRunner Auto Scaling Configuration name
   */
  getAppRunnerAutoScalingConfigurationName: (deployment: string) => string;
  /**
   * Returns the number of days to retain the CloudWatch logs for the AppRunner service.
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns Number of days to retain CloudWatch logs.
   */
  getLogRetentionInDays: (region: string, deployment: string) => number;
  /**
   * Returns the name of the environment variable containing the public URL of the AppRunner service.
   */
  serviceUrlConfigKey: string;
  /**
   * Returns the default configuration settings for the component.
   */
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
          `arn:aws:ssm:${region}:${accountId}:parameter/${VendorPrefix}/${deployment}/*`,
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
      {
        Effect: "Allow",
        Action: [
          "dynamodb:List*",
          "dynamodb:DescribeReservedCapacity*",
          "dynamodb:DescribeLimits",
          "dynamodb:DescribeTimeToLive",
        ],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: [
          "dynamodb:BatchGet*",
          "dynamodb:DescribeStream",
          "dynamodb:DescribeTable",
          "dynamodb:Get*",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWrite*",
          "dynamodb:CreateTable",
          "dynamodb:Delete*",
          "dynamodb:Update*",
          "dynamodb:PutItem",
        ],
        Resource: `arn:aws:dynamodb:${region}:${accountId}:table/${DBConfiguration.getTableName(
          deployment
        )}`,
      },
      {
        Effect: "Allow",
        Action: ["sqs:ListQueueTags", "sqs:ListQueues"],
        Resource: `arn:aws:sqs:${region}:${accountId}:*`,
      },
      {
        Effect: "Allow",
        Action: ["sqs:SendMessage"],
        Resource: `arn:aws:sqs:${region}:${accountId}:${VendorPrefix}-${deployment}*`,
      },
    ],
  }),
  getManagedPolicyArns: (region: string, deployment: string) => [],
  getEcrRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${componentName}`,
  getLocalRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${componentName}`,
  getAppRunnerServiceName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${componentName}`,
  getAppRunnerAutoScalingConfigurationName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${componentName}`,
  getLogRetentionInDays: (region: string, deployment: string) => 30,
});

/**
 * Parameters that control the creation of an App Runner service and related AWS resources for the _API_ component.
 */
export const ApiConfiguration: AppRunnerSettings = {
  ...createAppRunnerConfiguration("api"),
  serviceUrlConfigKey: ConfigSettings.ApiAppRunnerUrl,
  defaultConfig: {
    audience: [ConfigSettings.ApiAppRunnerAudience, StaticJwtAudience],
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

/**
 * Parameters that control the creation of an App Runner service and related AWS resources for the _web_ component.
 */
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
    auth0Audience: [ConfigSettings.Auth0Audience, StaticJwtAudience],
    auth0Scope: [
      ConfigSettings.Auth0Scope,
      "openid profile email offline_access",
    ],
    auth0Secret: [ConfigSettings.Auth0Secret, randomBytes(32).toString("hex")],
  },
};

/**
 * Parameters that control the creation of the _database_ component.
 */
export interface DBSettings {
  /**
   * Returns the name of the DynamoDB table to create.
   * @param deployment LetsGo deployment name
   * @returns DynamoDB table name
   */
  getTableName: (deployment: string) => string;
}

/**
 * Parameters that control the creation of the _database_ component.
 */
export const DBConfiguration: DBSettings = {
  getTableName: (deployment: string) => `${VendorPrefix}-${deployment}`,
};

/**
 * The collection of default configuration settings of the _worker_ component.
 */
export interface WorkerSettingsDefaultConfig extends DefaultConfig {
  /**
   * The maximum time in seconds an unconsumed message can stay in the SQS queue of the _worker_ component
   * before it is discarded.
   */
  messageRetentionPeriod: string[];
  /**
   * The time in seconds a message remains invisible in the SQS queue of the _worker_ component if it did not
   * confirm its processing.
   */
  visibilityTimeout: string[];
  /**
   * The time in seconds a request for a message from the SQS queue remains pending if no message is available to read.
   */
  receiveMessageWaitTime: string[];
  /**
   * The maximum time in seconds the Lambda function of the _worker_ component can run before it is terminated.
   */
  functionTimeout: string[];
  /**
   * The amount of memory allocated to the Lambda function of the _worker_ component.
   */
  functionMemory: string[];
  /**
   * The amount of ephemeral storage allocated to the Lambda function of the _worker_ component, available
   * in the `/tmp` directory.
   */
  functionEphemeralStorage: string[];
  /**
   * The maximum number of messages the _worker_ component can process in a single invocation of the Lambda function.
   */
  batchSize: string[];
  /**
   * The maximum time in seconds the _worker_ component waits for more messages to arrive before processing the batch.
   */
  batchingWindow: string[];
  /**
   * The maximum number of concurrent instances of the _worker_ component.
   * This number multipled by the {@link batchSize} is the upper bound on the number of concurrently processed messages.
   */
  concurrency: string[];
}

/**
 * Parameters that control the creation of AWS resources related to the _worker_ component.
 */
export interface WorkerSettings {
  /**
   * Returns the prefix of the name of the SQS of the _worker_ component.
   * @param deployment LetsGo deployment name
   * @returns Prefix of the SQS queue name
   */
  getQueueNamePrefix: (deployment: string) => string;
  /**
   * Returns the name of the IAM role to create for the the _worker_ component.
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns IAM role name
   */
  getRoleName: (region: string, deployment: string) => string;
  /**
   * Returns the name of the IAM policy to create for the the _worker_ component.
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns IAM policy name
   */
  getPolicyName: (region: string, deployment: string) => string;
  /**
   * Returns a JavaScript object describing the inline IAM policy that will be included in the IAM role
   * created for the _worker_ component.
   * @param accountId AWS account ID
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns IAM inline policy document
   */
  getInlineRolePolicy: (
    accountId: string,
    region: string,
    deployment: string
  ) => object;
  /**
   * Returns an array of ARNs of managed IAM policies to attach to the IAM role created for the _worker_ component.
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns Array of managed IAM policy ARNs
   */
  getManagedPolicyArns: (region: string, deployment: string) => string[];
  /**
   * Returns the name of the ECR repository to create to store the Docker images for the _worker_ component.
   * @param deployment LetsGo deployment name
   * @returns ECR repository name
   */
  getEcrRepositoryName: (deployment: string) => string;
  /**
   * Returns the name of the locally built Docker image containing code for the _worker_ component to be deployed.
   * @param deployment LetsGo deployment name
   * @returns Local Docker image name (without the tag)
   */
  getLocalRepositoryName: (deployment: string) => string;
  /**
   * Returns the name of the Lambda function to create for the _worker_ component.
   * @param deployment LetsGo deployment name
   * @returns Lambda function name
   */
  getLambdaFunctionName: (deployment: string) => string;
  /**
   * Returns the number of days to retain the CloudWatch logs for the Lambda function of the _worker_ component.
   * @param region AWS region
   * @param deployment LetsGo deployment name
   * @returns Number of days to retain CloudWatch logs.
   */
  getLogRetentionInDays: (region: string, deployment: string) => number;
  /**
   * Returns the default configuration settings for the component.
   */
  defaultConfig: WorkerSettingsDefaultConfig;
}

const WorkerName = "worker";

/**
 * Parameters that control the creation of AWS resources related to the _worker_ component.
 */
export const WorkerConfiguration: WorkerSettings = {
  getQueueNamePrefix: (deployment: string) => `${VendorPrefix}-${deployment}`,
  getRoleName: (region: string, deployment: string) =>
    `${VendorPrefix}-${region}-${deployment}-${WorkerName}`,
  getPolicyName: (region: string, deployment: string) =>
    `${VendorPrefix}-${region}-${deployment}-${WorkerName}`,
  getInlineRolePolicy: (
    accountId: string,
    region: string,
    deployment: string
  ) => ({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
        ],
        Resource: `arn:aws:sqs:${region}:${accountId}:${VendorPrefix}-${deployment}*`,
      },
      {
        Effect: "Allow",
        Action: [
          "dynamodb:List*",
          "dynamodb:DescribeReservedCapacity*",
          "dynamodb:DescribeLimits",
          "dynamodb:DescribeTimeToLive",
        ],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: [
          "dynamodb:BatchGet*",
          "dynamodb:DescribeStream",
          "dynamodb:DescribeTable",
          "dynamodb:Get*",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWrite*",
          "dynamodb:CreateTable",
          "dynamodb:Delete*",
          "dynamodb:Update*",
          "dynamodb:PutItem",
        ],
        Resource: `arn:aws:dynamodb:${region}:${accountId}:table/${DBConfiguration.getTableName(
          deployment
        )}`,
      },
    ],
  }),
  getManagedPolicyArns: (region: string, deployment: string) => [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  ],
  getEcrRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${WorkerName}`,
  getLocalRepositoryName: (deployment: string) =>
    `${VendorPrefix}-${WorkerName}`,
  getLambdaFunctionName: (deployment: string) =>
    `${VendorPrefix}-${deployment}-${WorkerName}`,
  getLogRetentionInDays: (region: string, deployment: string) => 30,
  defaultConfig: {
    messageRetentionPeriod: [
      ConfigSettings.WorkerMessageRetentionPeriod,
      "345600", // 4 days in seconds
    ],
    // AWS recommend setting visibility timeout to batching window + 6 x function timeout:
    visibilityTimeout: [ConfigSettings.WorkerVisibilityTimeout, "360"],
    receiveMessageWaitTime: [ConfigSettings.WorkerReceiveMessageWaitTime, "2"],
    batchSize: [ConfigSettings.WorkerBatchSize, "10"],
    batchingWindow: [ConfigSettings.WorkerBatchingWindow, "2"],
    concurrency: [ConfigSettings.WorkerCuncurrency, "5"],
    functionTimeout: [ConfigSettings.WorkerFunctionTimeout, "60"],
    functionMemory: [ConfigSettings.WorkerFunctionMemory, "128"],
    functionEphemeralStorage: [
      ConfigSettings.WorkerFunctionEphemeralStorage,
      "512",
    ],
  },
};
