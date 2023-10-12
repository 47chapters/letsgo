import {
  CloudWatchLogsClient,
  PutRetentionPolicyCommand,
  DescribeLogGroupsCommand,
  LogGroup,
  DeleteRetentionPolicyCommand,
} from "@aws-sdk/client-cloudwatch-logs";

function getCloudWatchClient(region: string) {
  return new CloudWatchLogsClient({
    region,
  });
}

export async function describeLogGroups(
  region: string,
  logGroupNamePrefix: string
): Promise<LogGroup[]> {
  const cloudwatch = getCloudWatchClient(region);
  const describeCommand = new DescribeLogGroupsCommand({
    logGroupNamePrefix,
  });
  const result = await cloudwatch.send(describeCommand);
  return result.logGroups || [];
}

export async function setLogGroupRetentionPolicy(
  region: string,
  logGroupName: string,
  retentionInDays: number
) {
  const cloudwatch = getCloudWatchClient(region);
  try {
    if (retentionInDays > 0) {
      const command = new PutRetentionPolicyCommand({
        logGroupName,
        retentionInDays,
      });
      await cloudwatch.send(command);
    } else {
      const command = new DeleteRetentionPolicyCommand({
        logGroupName,
      });
      await cloudwatch.send(command);
    }
  } catch (e: any) {
    if (e.name !== "ResourceNotFoundException") {
      throw e;
    }
  }
}
