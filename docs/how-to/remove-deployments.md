## Remove deployments

When you are ready to remove a deployment from AWS, you have two options:

1. You can remove only the transient artifacts (which can be re-created) while leaving all data in place (database, messages in the queue, ECR images).
1. You can remove everything including durable data.

Both options are discussed below.

### Removing a deployment, softly

This method of removing a deployment can be used to shut it down to save AWS costs while keeping all customer data around. This method removes the transient artifacts of deployment and leaves your durable data in place:

- The _database_ component.
- The SQS queue which holds the messages for the _worker_. (**NOTE** SQS will discard messages in the queue if they are not consumed during the time window [you configured](./manage-scalability.md#scaling-the-worker-component))
- The ECR images of the _worker_, _API_, and _web_.

**NOTE** The URLs of the _web_ and _API_ components as well as custom domain name configuration will be released. If you re-create the services later, they will be assigned new URLs. If you don't want to release the URLs of the services, consider stopping the services with `yarn ops stop` instead of removing them.

This allows you to later re-create the transient artifacts by [re-deploying to AWS](../tutorials/re-deploying-to-aws.md) and picking up from where you were in terms of the state of the data, and repeating the process of [configuring the custom domain](../tutorials/configuring-custom-domain.md).

To remove the deployment this way, run the following command:

```bash
yarn ops rm -a all
```

You can also specify the deployment by name with:

```bash
yarn ops rm -a all -d stage
```

### Removing the deployment, hard

**WARNING** This completely removes all deployment artifacts including durable data. All system and customer data in the _database_ will be lost, and so will the messages in the queue to be consumed by the _worker_. **There is no backup**.

**NOTE** If you ran this command in error, please refer to [jobs.com](https://www.jobs.com/) to find your next job.

To remove all artifacts related to a deployment, including durable data, run:

```bash
yarn ops rm -a all --kill-data
```

You can also specify the deployment by name with:

```bash
yarn ops rm -a all --kill-data -d stage
```

### Related topics

[Re-deployment to AWS](../tutorials/re-deploying-to-aws.md)
