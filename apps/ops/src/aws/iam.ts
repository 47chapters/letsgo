import {
  IAMClient,
  CreateRoleCommand,
  PutRolePolicyCommand,
  TagRoleCommand,
  ListAttachedRolePoliciesCommand,
  DetachRolePolicyCommand,
  AttachRolePolicyCommand,
  DeleteRoleCommand,
  DeleteRolePolicyCommand,
} from "@aws-sdk/client-iam";
import { getTags } from "./defaults";
import { getAccountId } from "./sts";
import { Logger } from "../commands/defaults";

export const AppRunnerAssumeRolePolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: {
        Service: [
          "tasks.apprunner.amazonaws.com",
          "build.apprunner.amazonaws.com",
        ],
      },
      Action: "sts:AssumeRole",
    },
  ],
};

export const LambdaAssumeRolePolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: {
        Service: ["lambda.amazonaws.com", "scheduler.amazonaws.com"],
      },
      Action: "sts:AssumeRole",
    },
  ],
};

const iam = new IAMClient({
  apiVersion: "2010-05-08",
});

export async function deleteRole(
  roleName: string,
  policyName: string,
  logger: Logger
) {
  logger(`deleting IAM role ${roleName}...`, "aws:iam");
  const deleteRolePolicyCommand = new DeleteRolePolicyCommand({
    RoleName: roleName,
    PolicyName: policyName,
  });
  try {
    await iam.send(deleteRolePolicyCommand);
  } catch (e: any) {
    if (e.name !== "NoSuchEntityException") {
      throw e;
    }
  }
  const listAttachedRolePoliciesCommand = new ListAttachedRolePoliciesCommand({
    RoleName: roleName,
  });
  let attachedArns: string[] = [];
  try {
    const listPoliciesResult = await iam.send(listAttachedRolePoliciesCommand);
    attachedArns = (listPoliciesResult.AttachedPolicies || []).map(
      (policy) => policy.PolicyArn || ""
    );
  } catch (e: any) {
    if (e.name !== "NoSuchEntityException") {
      throw e;
    }
  }
  for (const PolicyArn of attachedArns) {
    const detachPolicyCommand = new DetachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn,
    });
    try {
      await iam.send(detachPolicyCommand);
    } catch (e: any) {
      if (e.name !== "NoSuchEntityException") {
        throw e;
      }
    }
  }
  const deleteCommand = new DeleteRoleCommand({
    RoleName: roleName,
  });
  try {
    await iam.send(deleteCommand);
  } catch (e: any) {
    if (e.name !== "NoSuchEntityException") {
      throw e;
    }
  }
  logger(`deleted IAM role ${roleName}`, "aws:iam");
}

export async function ensureRole(
  region: string,
  deployment: string,
  roleName: string,
  policyName: string,
  managedPolicies: string[],
  inlinePolicy: object,
  assumeRolePolicy: object
): Promise<void> {
  const Tags = getTags(region, deployment);

  const updateInlinePolicy = async (expectRoleExists: boolean) => {
    const putPolicyCommand = new PutRolePolicyCommand({
      RoleName: roleName,
      PolicyName: policyName,
      PolicyDocument: JSON.stringify(inlinePolicy),
    });
    let roleExists = false;
    try {
      await iam.send(putPolicyCommand);
      roleExists = true;
    } catch (e: any) {
      if (e.name !== "NoSuchEntityException" || expectRoleExists) {
        throw e;
      }
    }
    return roleExists;
  };

  // Try updating inline policy in an existing role
  const roleExists = await updateInlinePolicy(false);
  if (!roleExists) {
    // If role does not exist, create it then update its online policy
    const createRoleCommand = new CreateRoleCommand({
      RoleName: roleName,
      AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicy),
      Tags,
    });
    await iam.send(createRoleCommand);
    await updateInlinePolicy(true);
  }

  // Update attached managed policies
  const listAttachedRolePoliciesCommand = new ListAttachedRolePoliciesCommand({
    RoleName: roleName,
  });
  const listPoliciesResult = await iam.send(listAttachedRolePoliciesCommand);
  const attachedArns = (listPoliciesResult.AttachedPolicies || []).map(
    (policy) => policy.PolicyArn || ""
  );
  const arnsToAdd = managedPolicies.filter(
    (arn) => !attachedArns.includes(arn)
  );
  const arnsToRemove = attachedArns.filter(
    (arn) => !managedPolicies.includes(arn)
  );
  for (const PolicyArn of arnsToRemove) {
    const detachPolicyCommand = new DetachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn,
    });
    await iam.send(detachPolicyCommand);
  }
  for (const PolicyArn of arnsToAdd) {
    const attachPolicyCommand = new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn,
    });
    await iam.send(attachPolicyCommand);
  }

  if (roleExists) {
    // If role existed, update its tags
    const tagRoleCommand = new TagRoleCommand({
      RoleName: roleName,
      Tags,
    });
    await iam.send(tagRoleCommand);
  } else {
    // Wait for the role changes to propagate. Unfortunately, there is no deteministic way of doing this in AWS.
    await new Promise((resolve) => setTimeout(resolve, 20000));
  }
}

export async function getRoleArn(roleName: string) {
  return `arn:aws:iam::${await getAccountId()}:role/${roleName}`;
}
