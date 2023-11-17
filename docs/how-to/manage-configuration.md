## Manage configuration

The _web_, _API_, and _worker_ components have a large number of configuration settings controlling things from authentication to payments to queue behavior. At runtime, all those settings are provided to the respective components using environment variables. There is a difference between how these settings are specified when you run LetsGo locally and in AWS. In addition, in case of running LetsGo in the cloud, there is an additional consideration of separately configuring multiple potential deployments.

### Specifying configuration settings when running locally

When running the stack locally, configuration settings for the _web_, _API_, and _worker_ components are provided via the `.env*` files, separately for each of the components. This minimum set of configuration settings for each of the components is described in detail in the [running locally](./run-locally.md) article. Refer to [@letsgo/constants](../reference/letsgo-constants/README.md) for a complete list of configuration settings you can set.

### Specifying configuration settings when running in AWS

Providing configuration settings for the _web_, _API_, and _worker_ components running in AWS is a two-stage process:

1. You set the desired configuration settings in [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) using the `yarn ops config set` command of the LetsGo CLI.
1. During the deployment of your stack using `yarn ops deploy`, a snapshot of the configuraiton settings in AWS Paramater Store is taken and set as environment variables on the AppRunner service of the _web_ and _API_ components and the AWS Lambda function of the _worker_ component. Configuration of deployed artifacts is immutable until the next deployment.

<img width="835" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/52f10cb4-16fd-4803-9d0d-1c8fe04ee9a0">

For example, to set the memory size of the _API_ processes, you can call:

```bash
yarn ops config set LETSGO_API_APPRUNNER_MEMORY=4096
```

You can then deploy a new version of the _API_ component with this configuration setting with:

```bash
yarn ops deploy -a api
```

In addition to the configuration settings sourced from the AWS Systems Manager Parameter Store, LetsGo CLI determines the following settings at deployment time and sets them explicily as environment variables an all _web_, _API_, and _worker_ components so that you don't need to provide them explicitly via `yarn ops config set`:

- `AUTH0_BASE_URL`
- `LETSGO_API_URL`
- `LETSGO_WEB_URL`
- `LETSGO_DEPLOYMENT`

Refer to [@letsgo/constants](../reference/letsgo-constants/README.md) for a complete list of configuration settings you can set, including their default values if not specified explicitly through `yarn ops config set`.

### Managing configuration of several deployments in AWS

You can [manage multiple deployments](./manage-multiple-deployments.md) of the LetsGo stack in AWS. Each deployment has its own set of configuration settings. All of the `yarn ops config` subcommands take `-d, --deployment` option which allows you to specify the name of the deployment for the command. For example, to set the memory size of the _API_ process for the deployment `stage`, you can call:

```bash
yarn ops config set LETSGO_API_APPRUNNER_MEMORY=2048 -d stage
```

You can then deploy a new version of the _API_ component to the `stage` deployment with:

```bash
yarn ops deploy -a api -d stage
```

### Related topics

[Available configuration settings and default values](../reference/letsgo-constants/README.md)  
[Manage multiple deployments](./manage-multiple-deployments.md)  
[Running locally](./run-locally.md)  
[LetsGo CLI](../reference/letsgo-cli.md)
