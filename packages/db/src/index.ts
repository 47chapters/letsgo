/**
 * This package facilitates access to the LetsGo database. It provides a simple set of CRUD operations
 * as well as a simple query interface.
 *
 * @module
 */

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

/**
 * Options that describe the location of the LetsGo database.
 */
export interface DeploymentOptions {
  /**
   * AWS region.
   */
  region?: string;
  /**
   * LetsGo deployment name.
   */
  deployment?: string;
}

/**
 * Options for reading data from the database.
 */
export interface GetItemOptions extends DeploymentOptions {
  /**
   * If true, the read will be strongly consistent read in DynamoDB.
   */
  consistentRead?: boolean;
}

/**
 * Options for listing data from the database.
 */
export interface ListItemsOptions extends GetItemOptions {
  /**
   * The maximum number of items to return.
   */
  limit?: number;
  /**
   * Continuation token for paginated results.
   */
  nextToken?: string;
}

/**
 * A database item.
 */
export interface DBItem {
  /**
   * The DynamoDB partition key.
   */
  category: string;
  /**
   * The DynamoDB sort key.
   */
  key: string;
  /**
   * The time-to-live (TTL) value for the item.
   */
  ttl?: number;
  /**
   * Any other attributes.
   */
  [key: string]: any;
}

/**
 * The result of a list operation.
 */
export interface ListItemsResult<T extends DBItem> {
  /**
   * The list of items matching the query.
   */
  items: T[];
  /**
   * Continuation token for paginated results. If present, the client should pass this token
   * to the next call to using {@link ListItemsOptions.nextToken} to
   * retrieve the next page of results.
   */
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
      region,
    });
  }
  return clients[region];
}

/**
 * Retrieves a single item from the database.
 * @param category The partition key
 * @param key The sort key
 * @param options Options for the operation
 * @returns A promise that resolves to the item or undefined if the item does not exist or has expired.
 */
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

/**
 * Upserts an item in the database.
 * @param item The item to upsert
 * @param options Options for the operation
 */
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

/**
 * Ensures the item is deleted. If the item does not exist, this operation is a no-op.
 * @param category The partition key
 * @param key The sort key
 * @param options Options for the operation
 */
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

/**
 * Lists items in the database that match the given category and key prefix. This function suports pagination.
 * @param category The partition key
 * @param keyPrefix The prefix of the sort key
 * @param options Options for the operation
 * @returns Matching items an an optional continuation token for paginated results.
 */
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
    items: (queryCommandResult.Items || [])
      .map((item) => unmarshall(item) as T)
      .filter(
        (item) =>
          item.ttl === undefined || item.ttl >= Math.floor(Date.now() / 1000)
      ),
    nextToken:
      queryCommandResult.LastEvaluatedKey &&
      Buffer.from(JSON.stringify(queryCommandResult.LastEvaluatedKey)).toString(
        "base64"
      ),
  };
  return result;
}
