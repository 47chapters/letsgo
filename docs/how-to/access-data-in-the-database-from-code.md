## Access data in the database from code

LetsGo provides the `@letsgo/db` package in the `packages/db` directory to facilitate accessing [data in the database](../backgound/data-model.md). It offers basic CRUD operations as well as listing of items in the database. If you need more advanced constructs, you will need to add new functions to the package.

<img width="844" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/490eda3c-e494-4958-9749-252c8ed8fe31">

The `@letsgo/db` package is already included and ready for use in the _API_ and _worker_ components, both when running locally or in the cloud.

Before moving on, make sure you are familiar with the [data model](../backgound/data-model.md) of the LetsGo database.

### Define your schema

It is a good practice to strongly type the data you want to store in the database for consistency between components. A convenient place to share those types is in the `@letsgo/types` package in `packages/types` directory.

All data stored in the database must extend the `DBItem` interface, which defines three properties:

```typescript
export interface DBItem {
  category: string;
  key: string;
  ttl?: number;
  [key: string]: any;
}
```

Let's define an `Order` type to use as an example in this article.

```typescript
export interface Order extends DBItem {
  orderId: string;
  customerId: string;
  total: number;
  items: string[];
}
```

### Categories and keys

For each type of data you store in the database, you must define its `category` value. The value cannot start with `letsgo`, which is reserved for use by LetsGo boilerplate entities (e.g. `letsgo-tenant`). For orders, we will therefore use the `category` value of `order`.

The `key` must be unique within a `category`. We will therefore use the same value for the `key` as `orderId`.

### Saving an item to the database

The `putItem` function from `@letsgo/db` has the upsert semantics and can be used to add or update an entry with a specific `category` and `key` in the database. To create or update an order:

```typescript
import { putItem } from "@letsgo/db";

//...

const order: Order = {
  category: "order",
  key: "ord-123",
  orderId: "ord-123",
  customerId: "cus-456",
  total: 12,
  items: ["cat", "dog"],
};

await putItem(order);
```

### Getting an item from the database

The `getItem` function from `@letsgo/db` returns an item with the specified `category` and `key` from the database, or `undefined` if such value does not exist.

```typescript
import { getItem } from "@letsgo/db";

//...

const order = await getItem<Order>("order", "ord-123");
// order is an Order or undefined
```

The `getItem` function can also perform a [DynamoDB's consistent read](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html) with an extra option:

```typescript
const order = await getItem<Order>("order", "ord-123", {
  consistentRead: true,
});
```

### Deleting an item

The `deleteItem` function from `@letsgo/db` deletes an item with the specified `category` and `key` from the database. If the item did not exist in the database in the first place, the function returns without error.

```typescript
import { deleteItem } from "@letsgo/db";

//...

const order = await deleteItem("order", "ord-123");
```

### Listing items

The `listItems` function from `@letsgo/db` lists database items with a specified `category` and a specified _prefix_ of the `key`. In the simplest form, to list orders, you would call:

```typescript
import { listItems } from "@letsgo/db";

//...

const result = await listItems<Order>("order", "");
console.log("ORDERS", result.items);
```

Notice the second parameter to the `listItems` call is an empty string. Since it represents the _prefix_ of the `key`, it means we are going to list all orders, since an empty string is a prefix of any key.

The `listItems` API supports paging. If the result contains a `nextToken` property, you can obtain a subsequent set of results by passing that `nextToken` as an option in the next call to `listItems`. To ensure you have listed all orders, you can write code like this:

```typescript
let nextToken: string | undefined = undefined;
do {
  const result = listItems<Order>("order", "", { nextToken });
  console.log("ORDERS", result.items);
  nextToken = result.nextToken;
} while (nextToken);
```

The `listItems` function also supports limiting the number of results returned in a single call:

```typescript
const result = await listItems<Order>("order", "", { limit: 5 });
console.log("ORDERS", result.items);
```

**NOTE** When you specify `limit`, the call will return _up to_ that number of results, even if at the same time a `nextToken` is retured.

### Modeling is-part-of relationships

In application data modelling it is very common to encounter one-to-many or many-to-many relationships between entities. For example, in the [LetsGo tenancy model](../backgound/tenants-and-users.md) there is a many-to-many relationship between tenants and users of the system.

One useful pattern for representing such relationships in the LetsGo database is through the use of hierarchical `key` properties.

Consider there are two users in the system: `usr-1`, `usr-2`, and two tenants: `ten-1`, `ten-2`. Let's then assume that `usr-1` has access to both tenants, and `usr-2` only to `ten-2`.

You can represent these relationships using two database categories: `tenant-user` and `user-tenant`, each with hierarchical keys of the form `/{tenantId}/{userId}` and `/{userId}/{tenantId}`, respectively:

```typescript
await putItem({ category: "tenant-user", key: "/ten-1/usr-1" });
await putItem({ category: "tenant-user", key: "/ten-2/usr-1" });
await putItem({ category: "tenant-user", key: "/ten-2/usr-2" });

await putItem({ category: "user-tenant", key: "/usr-1/ten-1" });
await putItem({ category: "user-tenant", key: "/usr-1/ten-2" });
await putItem({ category: "user-tenant", key: "/usr-2/ten-2" });
```

With this data in place, we can now efficiently determine which users are part of a particular tenant, and which tenants a specific user has access to:

```typescript
// Get tenants that usr-1 has access to:
const tenantsUsr1HasAccessTo = await listItems<any>("user-tenant", "/usr-1/");

// Get users who have access to tenant ten-1:
const usersWithAccessToTen1 = await listItems<any>("tenant-user", "/ten-1/");
```

Notice how in the `listItems` calls above the second parameter is a _prefix_ of a hierarchical `key`.

### Automatic expiry

The LetsGo database can automatically expire items that are stored. This is done by specifying a special `ttl` property with the number of seconds after which the item should be removed:

```typescript
await putItem({
  category: "session",
  key: "ses-123",
  accessToken: "ey...",
  ttl: 3600,
});
```

In the example above, the session stored in the database will disappear after 1 hour.

### Access data using the LetsGo CLI

The [LetsGo CLI](../reference/letsgo-cli.md) supports the `yarn ops db` command which is a wrapper around the `@letsgo/db` package. You can use this CLI command to manipulate data in the database from the command line and from scripts.

### Related topics

[Data model](../backgound/data-model.md)  
[LetsGo CLI](../reference/letsgo-cli.md)  
[Enqueue asynchronous work](./enqueue-asynchronous-work.md)  
[Develop the api](./develop-the-api.md)  
[Develop the worker](./develop-the-worker.md)
