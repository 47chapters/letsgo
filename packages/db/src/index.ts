import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import {
  DefaultRegion,
  DefaultDeployment,
  DBConfiguration,
} from "@letsgo/constants";

const tableNames: Record<string, string> = {};
const clients: Record<string, DynamoDBClient> = {};

class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode || 500;
  }
}

export interface DeploymentOptions {
  region?: string;
  deployment?: string;
}

export interface GetItemOptions extends DeploymentOptions {
  consistentRead?: boolean;
}

export interface ListItemsOptions extends GetItemOptions {
  limit?: number;
  nextToken?: string;
}

export interface DBItem {
  category: string;
  key: string;
  ttl?: number;
  [key: string]: any;
}

export interface ListItemsResult<T extends DBItem> {
  items: T[];
  nextToken?: string;
}

async function getTableName(options?: DeploymentOptions): Promise<string> {
  const deployment = options?.deployment || DefaultDeployment;
  if (!tableNames[deployment]) {
    tableNames[deployment] = DBConfiguration.getTableName(deployment);
  }
  return tableNames[deployment];
}

async function getClient(options?: DeploymentOptions): Promise<DynamoDBClient> {
  const region = options?.region || DefaultRegion;
  if (!clients[region]) {
    clients[region] = new DynamoDBClient({
      region: DefaultRegion,
    });
  }
  return clients[region];
}

export async function getItem<T extends DBItem>(
  category: string,
  key: string,
  options?: GetItemOptions
): Promise<T | undefined> {
  const client = await getClient(options);
  const TableName = await getTableName(options);
  const getCommand = new GetItemCommand({
    TableName,
    Key: marshall({ category, key }),
    ...{ ConsistentRead: !!options?.consistentRead },
  });
  const result = await client.send(getCommand);
  const item: any = result.Item && unmarshall(result.Item);
  if (item?.ttl < Math.floor(Date.now() / 1000)) {
    return undefined;
  } else {
    return item as T;
  }
}

export async function putItem<T extends DBItem>(
  item: T,
  options?: DeploymentOptions
): Promise<void> {
  const client = await getClient(options);
  const TableName = await getTableName(options);
  const putCommand = new PutItemCommand({
    TableName,
    Item: marshall(item, { removeUndefinedValues: true }),
  });
  await client.send(putCommand);
}

export async function deleteItem(
  category: string,
  key: string,
  options?: DeploymentOptions
): Promise<void> {
  const client = await getClient(options);
  const TableName = await getTableName(options);
  const deleteItem = new DeleteItemCommand({
    TableName,
    Key: marshall({ category, key }),
  });
  await client.send(deleteItem);
}

export async function listItems<T extends DBItem>(
  category: string,
  keyPrefix: string,
  options?: ListItemsOptions
): Promise<ListItemsResult<T>> {
  let ExclusiveStartKey: Record<string, AttributeValue> | undefined;
  try {
    ExclusiveStartKey =
      options?.nextToken &&
      JSON.parse(Buffer.from(options.nextToken, "base64").toString("utf8"));
  } catch (e: any) {
    throw new HttpError(
      `Invalid (malformed) nextToken: ${options?.nextToken}`,
      400
    );
  }
  const client = await getClient(options);
  const TableName = await getTableName(options);
  const queryCommand = new QueryCommand({
    TableName,
    ExpressionAttributeValues: {
      ":category": { S: category },
      ...(keyPrefix.length > 0 ? { ":keyPrefix": { S: keyPrefix } } : {}),
    },
    ...(keyPrefix.length > 0
      ? {
          ExpressionAttributeNames: {
            "#key": "key",
          },
        }
      : {}),
    KeyConditionExpression:
      keyPrefix.length > 0
        ? "category = :category AND begins_with(#key, :keyPrefix)"
        : "category = :category",
    ...{
      ConsistentRead: !!options?.consistentRead,
      Limit: options?.limit,
      ExclusiveStartKey,
    },
  });
  const queryCommandResult = await client.send(queryCommand);
  const result = {
    items: (queryCommandResult.Items || []).map(
      (item) => unmarshall(item) as T
    ),
    nextToken:
      queryCommandResult.LastEvaluatedKey &&
      Buffer.from(JSON.stringify(queryCommandResult.LastEvaluatedKey)).toString(
        "base64"
      ),
  };
  return result;
}
