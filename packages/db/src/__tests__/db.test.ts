import "dotenv/config";
import { getItem, putItem, deleteItem, listItems } from "..";

const TestCategory = "letsgo-test";
const TestKeyPrefix = `${Math.floor(Math.random() * 100000)}/`;

const getTestKey = (suffix: string) => `${TestKeyPrefix}${suffix}`;

const objectValue = {
  string: "bar",
  number: 12,
  bool: true,
  array: [1, 2, "a"],
  object: { a: "b" },
};

describe("db", () => {
  afterEach(async () => {
    const result = await listItems(TestCategory, TestKeyPrefix, {
      consistentRead: true,
    });
    const parallel: Promise<any>[] = result.items.map((item) =>
      deleteItem(item.category, item.key)
    );
    await Promise.all(parallel);
  });

  it("getItem returns undefined for a non-existing item", async () => {
    const result = await getItem(TestCategory, "idontexist");
    expect(result).toBeUndefined();
  });

  it("putItem/getItem succeeds with an object", async () => {
    const key = getTestKey("object");
    const item = { category: TestCategory, key, ...objectValue };
    await putItem(item);
    const result = await getItem(TestCategory, key, { consistentRead: true });
    expect(result).toMatchObject(item);
  });

  it("putItem/getItem succeeds with a non-expired TTL", async () => {
    const key = getTestKey("nonExpiredTTL");
    const item = {
      category: TestCategory,
      key,
      ttl: Math.floor(Date.now() / 1000) + 60,
      ...objectValue,
    };
    await putItem(item);
    const result = await getItem(TestCategory, key, { consistentRead: true });
    expect(result).toMatchObject(item);
  });

  it("putItem/getItem returns undefined with an expired TTL", async () => {
    const key = getTestKey("expiredTTL");
    const item = {
      category: TestCategory,
      key,
      ttl: Math.floor(Date.now() / 1000) - 60,
      ...objectValue,
    };
    await putItem(item);
    const result = await getItem(TestCategory, key, { consistentRead: true });
    expect(result).toBeUndefined();
  });

  it("putItem/deleteItem/getItem returns undefined", async () => {
    const key = getTestKey("putDeleteGetObject");
    const item = {
      category: TestCategory,
      key,
      ...objectValue,
    };
    await putItem(item);
    await deleteItem(TestCategory, key);
    const result = await getItem(TestCategory, key, {
      consistentRead: true,
    });
    expect(result).toBeUndefined();
  });

  it("putItem/listItems returns all items", async () => {
    const keyPrefix = getTestKey("putListItems");
    const items = [{ v: 1 }, { v: 2 }, { v: 3 }];
    for (const item of items) {
      await putItem({
        category: TestCategory,
        key: `${keyPrefix}/${item.v}`,
        ...item,
      });
    }
    const result = await listItems(TestCategory, keyPrefix, {
      consistentRead: true,
    });
    expect(result.items).toHaveLength(3);
    for (const item of result.items) {
      expect(item.category).toBe(TestCategory);
      expect(item.key).toBeDefined();
      expect(item.v).toBeDefined();
      expect(item.v).toBe(+(item.key.split("/").pop() || ""));
    }
    expect(result.nextToken).toBeUndefined();
  });

  it("putItem/listItems pages results", async () => {
    const keyPrefix = getTestKey("putListItems");
    const items = [{ v: 1 }, { v: 2 }, { v: 3 }];
    for (const item of items) {
      await putItem({
        category: TestCategory,
        key: `${keyPrefix}/${item.v}`,
        ...item,
      });
    }
    let nextToken: string | undefined;
    for (const i of [0, 1, 2]) {
      const result = await listItems(TestCategory, keyPrefix, {
        consistentRead: true,
        limit: 1,
        nextToken,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].category).toBe(TestCategory);
      expect(result.items[0].key).toBeDefined();
      expect(result.items[0].v).toBeDefined();
      expect(result.items[0].v).toBe(
        +(result.items[0].key.split("/").pop() || "")
      );
      if (i < 2) {
        expect(result.nextToken).toBeDefined();
      } else {
        expect(result.nextToken).toBeUndefined();
      }
      nextToken = result.nextToken;
    }
  });
});
