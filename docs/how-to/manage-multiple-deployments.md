## Manage multiple deployments

A single deployment of LetsGo consists of the following components:

<img width="950" alt="LetsGo Architecture" src="https://github.com/47chapters/letsgo/assets/822369/c9e803b3-c2ee-4b2e-b8a4-16e107342c4e">

You can maintain multiple deployments of this stack in the same or different regions of AWS, and the [LetsGo CLI](../reference/letsgo-cli.md) makes it easy to set up and manage them all. You can also use LetsGo CLI to manage LetsGo stacks across different AWS accounts.

There are two primary scenarios targeted with the support for multiple deployments:

1. Separating your production/development workloads. You can choose to run _prod_ and _stage_ deployments, or even have a separate deployment for individual developers on your team.
1. Providing your customers with dedicated deployments. You can run those deployments on your AWS account or on your customer's AWS account as long as you have access to it.

In either scenario, the LetsGo CLI provides a consistent and repeatable mechanism to manage the configuration and the lifecycle of the deployment.

### Deployment isolation

Deployments of LetsGo are designed to be isolated from one another, even if they are running on the same AWS account:

- No data is shared between deployments, and the IAM policies of each deployment only allow it access to its own data. This applies to DynamoDB tables, SQS queues, ECR images, and SSM Parameter Store.
- No components are shared between deployments. Each deployment has its own AppRunner services, Lambda functions, SQS queues, DynamoDB tables, a namespace in the SSM Parameter Store, and IAM policies.
- All components and data of a deployment reside in the AWS region where that deployment was created.

Deployments do share the account and region-level AWS quotas, which is something to keep in mind when running multiple LetsGo deployments on the same AWS account or alongside other artifacts.

### Deployment cost

The cost to maintain an idle deployment varies by AWS region but is in the $20/month vicinity. The pricing model for the components used by LetsGo deployments is mostly pas-as-you-go (DynamoDB, Lambda, AppRunner, SQS), so the cost will increase as your deployment sees more traffic.

### Managing multiple deployments on the same AWS account

Each [LetsGo CLI](../reference/letsgo-cli.md) command accepts two options: `-r, --region`, and `-d, --deployment`, which allow you to specify the AWS region and LetsGo deployment name this command applies to. The default deployment name is `main` (unless overridden by the `LETSGO_DEPLOYMENT` environment variable), and the default region is `us-west-2` (unless overridden by the `AWS_REGION` environment variable).

For example, to deploy a new stack called `stage` in the default region, you would call:

```bash
yarn ops deploy -a all -d stage
```

To deploy a new stack for a new developer on your team in the `us-east-1` region, you could call:

```bash
yarn ops deploy -a all -r us-east-1 -d dev-emma
```

### Managing multiple deployments across AWS accounts

The [LetsGo CLI](../reference/letsgo-cli.md) does not provide first-class support for specifying AWS accounts. Instead, it relies on the default AWS account configured at the AWS SDK level, which is the same as the default AWS account you configure for use by the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-using-profiles).

If you want to operate on several AWS accounts using a single LetsGo installation on your machine, define an [AWS CLI named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-using-profiles) for each of the accounts using the AWS CLI configuration file, and then use the `AWS_PROFILE` environment variable to select the profile you want when running a LetsGo CLI command, e.g.:

```bash
AWS_PROFILE=customer17 yarn ops deploy -a all
```

### Related topics

[Manage configuration](./manage-configuration.md)  
[LetsGo CLI](../reference/letsgo-cli.md)
