import chalk from "chalk";
import {
  DynamoDBClient,
  CreateTableCommand,
  UpdateTimeToLiveCommand,
  DescribeTableCommand,
  DescribeTableCommandOutput,
  TableDescription,
  DeleteTableCommand,
} from "@aws-sdk/client-dynamodb";
import { DBSettings } from "../vendor";
import { Logger } from "../commands/defaults";
import { getTags } from "./defaults";

const MaxTableWaitTime = 60 * 5; // 5 minutes

async function waitForTable(
  region: string,
  tableName: string,
  maxWait: number,
  isDeleting: boolean,
  logger: Logger
): Promise<TableDescription | undefined> {
  const dynamodb = new DynamoDBClient({ region });
  let clock = 0;
  let delay = 1;
  const describeCommand = new DescribeTableCommand({ TableName: tableName });
  while (true) {
    let result: DescribeTableCommandOutput;
    try {
      result = await dynamodb.send(describeCommand);
    } catch (e: any) {
      if (e.name === "ResourceNotFoundException" && isDeleting) {
        return undefined;
      }
      throw e;
    }
    const status = result.Table?.TableStatus;
    logger(`${clock}s table status: ${status}`);
    if (isDeleting) {
      if (status !== "DELETING") {
        logger(
          chalk.red(
            `failure deleting ${tableName} table: unexpected table status ${status}`
          )
        );
        process.exit(1);
      }
    } else {
      if (status === "ACTIVE") {
        return result.Table;
      } else if (status !== "CREATING") {
        logger(
          chalk.red(
            `failure creating ${tableName} table: unexpected table status ${status}`
          )
        );
        process.exit(1);
      }
    }
    if (clock >= maxWait) {
      return isDeleting ? result.Table : undefined;
    }
    if (clock > 60) {
      delay = 10;
    } else if (clock > 20) {
      delay = 5;
    } else if (clock > 5) {
      delay = 2;
    }
    clock += delay;
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  }
}

export async function deleteDynamo(
  region: string,
  deployment: string,
  settings: DBSettings,
  logger: Logger
) {
  const TableName = settings.getTableName(deployment);
  logger(`deleting table ${TableName}...`, "aws:dynamodb");
  const dynamodb = new DynamoDBClient({ region });
  const command = new DeleteTableCommand({
    TableName,
  });
  try {
    await dynamodb.send(command);
  } catch (e: any) {
    if (e.name === "ResourceNotFoundException") {
      return undefined;
    }
    throw e;
  }
  await waitForTable(region, TableName, MaxTableWaitTime, true, logger);
  logger(`table ${TableName} deleted`, "aws:dynamodb");
}

export async function getTable(
  region: string,
  deployment: string,
  settings: DBSettings
): Promise<TableDescription | undefined> {
  const dynamodb = new DynamoDBClient({ region });
  const TableName = settings.getTableName(deployment);
  const command = new DescribeTableCommand({
    TableName,
  });
  try {
    const result = await dynamodb.send(command);
    return result.Table;
  } catch (e: any) {
    if (e.name === "ResourceNotFoundException") {
      return undefined;
    }
    throw e;
  }
}

export async function ensureDynamo(
  region: string,
  deployment: string,
  settings: DBSettings,
  logger: Logger
) {
  const TableName = settings.getTableName(deployment);
  logger(`ensuring table ${TableName} exists...`, "aws:dynamodb");
  const dynamodb = new DynamoDBClient({ region });
  const Tags = getTags(region, deployment);
  const command = new CreateTableCommand({
    TableName,
    AttributeDefinitions: [
      {
        AttributeName: "category",
        AttributeType: "S",
      },
      {
        AttributeName: "key",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "category",
        KeyType: "HASH",
      },
      {
        AttributeName: "key",
        KeyType: "RANGE",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
    Tags,
  });
  try {
    await dynamodb.send(command);
  } catch (e: any) {
    if (e.name !== "ResourceInUseException") {
      throw e;
    }
    logger(
      `table ${TableName} already exists, ${chalk.yellow("no changes made")}`,
      "aws:dynamodb"
    );
    return;
  }
  const tableDesciption = await waitForTable(
    region,
    TableName,
    MaxTableWaitTime,
    false,
    logger
  );
  if (!tableDesciption) {
    logger(
      chalk.red(
        `table ${TableName} was created but did not reach the CREATED state within ${MaxTableWaitTime} seconds`
      ),
      "aws:dynamodb"
    );
    logger(
      chalk.red(`verify the status of the ${TableName} table in AWS`),
      "aws:dynamodb"
    );
    process.exit(1);
  }
  const updateTTLCommand = new UpdateTimeToLiveCommand({
    TableName,
    TimeToLiveSpecification: {
      AttributeName: "ttl",
      Enabled: true,
    },
  });
  await dynamodb.send(updateTTLCommand);
  logger(`table ${TableName} created`, "aws:dynamodb");
}
