import {
  ECRClient,
  CreateRepositoryCommand,
  DescribeImagesCommand,
  GetAuthorizationTokenCommand,
  DeleteRepositoryCommand,
} from "@aws-sdk/client-ecr";
import { getTags } from "./defaults";
import { spawn } from "child_process";
import { getAccountId } from "./sts";
import { Logger } from "../commands/defaults";

const apiVersion = "2015-09-21";

function getECRClient(region: string) {
  return new ECRClient({
    apiVersion,
    region,
  });
}

export async function ensureRepository(
  region: string,
  deployment: string,
  repositoryName: string
): Promise<void> {
  const ecr = getECRClient(region);
  const command = new CreateRepositoryCommand({
    repositoryName,
    tags: getTags(region, deployment),
  });
  try {
    const result = await ecr.send(command);
  } catch (e: any) {
    if (e.name !== "RepositoryAlreadyExistsException") {
      throw e;
    }
  }
}

export async function ensureImage(
  region: string,
  ecrRepositoryName: string,
  localRepositoryName: string,
  imageTag: string,
  logger: Logger
): Promise<void> {
  const ecr = getECRClient(region);
  const ecrRepositoryUrl = await getEcrRepositoryArn(region, ecrRepositoryName);

  // Check if image already exists in the registry
  const describeImagesCommand = new DescribeImagesCommand({
    repositoryName: ecrRepositoryName,
    imageIds: [{ imageTag }],
  });
  try {
    const result = await ecr.send(describeImagesCommand);
    return; // image already exists
  } catch (e: any) {
    if (e.name !== "ImageNotFoundException") {
      throw e;
    }
  }

  // Get ECR Authorization token
  const getAuthorizationTokenCommand = new GetAuthorizationTokenCommand({});
  const getAuthorizationTokenCommandResult = await ecr.send(
    getAuthorizationTokenCommand
  );
  const [username, password] = (
    Buffer.from(
      getAuthorizationTokenCommandResult.authorizationData?.[0]
        ?.authorizationToken || "",
      "base64"
    ).toString() || "NA:NA"
  ).split(":");

  // Push image to ECR
  const [ecrRepositoryDomain] = ecrRepositoryUrl.split("/");
  const command = [
    `docker login -u ${username} --password-stdin https://${ecrRepositoryDomain} &&`,
    `docker tag ${localRepositoryName}:${imageTag} ${ecrRepositoryUrl}:${imageTag} &&`,
    `docker push ${ecrRepositoryUrl}:${imageTag}`,
  ].join(" ");
  const options = {
    input: password,
    encoding: "utf8",
  };
  const logDockerOutput = (data: string) => {
    data = data.trim();
    if (data) {
      data.split("\n").forEach((line) => logger(line, "aws:ecr"));
    }
  };
  await new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true });
    child.stdin.write(password);
    child.stdin.end();
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", logDockerOutput);
    child.stderr.on("data", logDockerOutput);
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`Pushing the image to ECR failed with code ${code}`));
      }
    });
  });
}

export async function deleteRepository(
  region: string,
  repositoryName: string,
  logger: Logger
): Promise<void> {
  const ecr = getECRClient(region);
  const command = new DeleteRepositoryCommand({
    repositoryName,
    force: true,
  });
  try {
    logger(`deleting ECR repository ${repositoryName}...`, "aws:ecr");
    const result = await ecr.send(command);
    logger(`deleted ECR repository ${repositoryName}`, "aws:ecr");
  } catch (e: any) {
    if (e.name !== "RepositoryNotFoundException") {
      throw e;
    }
  }
}

export async function getEcrRepositoryArn(
  region: string,
  repositoryName: string
) {
  return `${await getAccountId()}.dkr.ecr.${region}.amazonaws.com/${repositoryName}`;
}
