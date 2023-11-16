## Data model

The _database_ component of LetsGo consists of a single [DynamoDB](https://aws.amazon.com/pm/dynamodb) table with a very specific structure and usage patten desribed below.

<img width="844" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/490eda3c-e494-4958-9749-252c8ed8fe31">

### Table structure

The [composite primary key](https://aws.amazon.com/blogs/database/choosing-the-right-dynamodb-partition-key/) in the DynamoDB table LetsGo creates consists of two properties:

- `category` - a string that is a partition key
- `key` - a string that is a sort key

The `category` conceptually represents the entity class of an item. If you want to store _orders_ and _customers_ in your database, each of them would be given a unique category name. A `category` can also be used to represent the relationships between entities. For example, to maintain a relationship between a customer and an order, you could define a `customer-order` category.

The `key` is a unique identifier of the entity within a category. In the `orders` category, a key could be the order ID, for example `order-123`. In the `customer-order` category that represents the relationship between a customer and an order, the key can be a composite of the customer ID and order ID, e.g. `/customer-123/order-456`.

This pattern of using the `category` and `key` properties allows not only for simple CRUD operations, but also for common search patterns to be efficiently implemented. This is because DynamoDB has a first class, efficient way of searching for items in the database with a specific partition key (`category`) and a specific _prefix_ of the sort key (`key`). It makes it possible to use the categories that represent entity relationships to efficiently query for associated entities. For example, to find all orders placed by `customer-123`, you can issue a query for items with the`customer-order` catagory that have a _prefix_ of the key equal to `/customer-123/`.

The [accessing data in the database](../how-to/access-data-in-the-database-from-code.md) article describes how to access the database from code of the _API_ or _worker_ component.

**NOTE** LetsGo reserves `category` names starting with `letsgo` for internal use. If you define new category names, use category names that do not start with `letsgo`.

### Automatic item expiration

The DynamoDB table created by LetsGo supports automatic expiration of items. This can be requested by adding a `ttl` property to the item stored in the database. The property is a number that represents the desired expiration time of the item. When that time elapses, DynamoDB will remove the item from the database.

Note that in practice DynamoDB itself may still include an expired item in the results of search queries or explicit get operation. However the [@letsgo/db](../reference/letsgo-db/README.md) module that LetsGo provides to facilitate DB access is normalizing this behavior in code - you will never get back an expired item.

### System categories

LetsGo maintains several categories in the database to support the functionality that comes with the platform. These are described in [System database categories](../reference/system-database-categories.md).

### Related topics

[Accessing data in the database from code](../how-to/access-data-in-the-database-from-code.md)  
[System database categories](../reference/system-database-categories.md)  
[LetsGo CLI](../reference/letsgo-cli.md)
