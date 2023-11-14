## Remove deployments

When you are ready to remove a deployment from AWS, you have two options:

1. You can remove only the transient artifacts (which can be re-created) while leaving all data in place (database, messages in the queue, ECR images).
1. You can remove everything including durable data.

Both options are discussed below.

### Removing a deployment, softly

This method of removing a deployment can be used to temporarily shut it down to save AWS costs with the intention of restarting it later in the same state. This method only removes the transient artifacts of a deployment and leaves your durable data in place:

- The _database_ component.
- The SQS queue holding the messages for the _worker_.
- The ECR images of the _worker_, _API_, and _web_.

This allows you to later re-create the transitent artifacts by [re-deploying to AWS](../tutorials/re-deploying-to-aws.md) and pick up from where you were in terms in the state of the data.

To remove the deployment this way, run the following command:

```bash
yarn ops rm -a all
```

You can also specify the deployment by name with:

```bash
yarn ops rm -a all -d stage
```

### Removing the deployment, hard

**WARNING** This completely removes all deployment artifacts including durable data. All system and customer data in the _database_ will be lost, so will the messages in the queue to be consumed by the _worker_. **There is no backup**.

**NOTICE** If you ran this command in error, please refer to [jobs.com](https://www.jobs.com/) to find your next job.

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
