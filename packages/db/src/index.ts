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

let tableName: string;
let client: DynamoDBClient;

class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode || 500;
  }
}

async function getTableName(): Promise<string> {
  if (!tableName) {
    tableName = DBConfiguration.getTableName(DefaultDeployment);
  }
  return tableName;
}

async function getClient(): Promise<DynamoDBClient> {
  if (!client) {
    client = new DynamoDBClient({
      region: DefaultRegion,
    });
  }
  return client;
}

export interface GetItemOptions {
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

export async function getItem<T extends DBItem>(
  category: string,
  key: string,
  options?: GetItemOptions
): Promise<T | undefined> {
  const client = await getClient();
  const TableName = await getTableName();
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

export async function putItem<T extends DBItem>(item: T): Promise<void> {
  const client = await getClient();
  const TableName = await getTableName();
  const putCommand = new PutItemCommand({
    TableName,
    Item: marshall(item, { removeUndefinedValues: true }),
  });
  await client.send(putCommand);
}

export async function deleteItem(category: string, key: string): Promise<void> {
  const client = await getClient();
  const TableName = await getTableName();
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
  const client = await getClient();
  const TableName = await getTableName();
  const queryCommand = new QueryCommand({
    TableName,
    ExpressionAttributeValues: {
      ":category": { S: category },
      ":keyPrefix": { S: keyPrefix },
    },
    ExpressionAttributeNames: {
      "#key": "key",
    },
    KeyConditionExpression:
      "category = :category AND begins_with(#key, :keyPrefix)",
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
