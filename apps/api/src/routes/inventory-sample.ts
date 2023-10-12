/**
 * This sample illustrates how to use the @letsgo/db package to create a simple REST API for managing store inventory.
 *
 * The API manages multiple stores with multiple products in each store. The API offers CRUD over stores and products, as
 * well as listing all stores and all products in a store.
 *
 * For clarity of example, a lot of the data validation and error handling that would normally be required is omitted.
 */

import { Router, Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { getItem, putItem, deleteItem, listItems, DBItem } from "@letsgo/db";

const router = Router();

// Database categories for persisting store and product information, respectively
const StoreCategory = "store";
const ProductCategory = "product";

// Helper functions for constructing hierarchical database keys for stores and products
const getStoreKey = (storeId: string) => `/${storeId}`;
const getProductKey = (storeId: string, productId?: string) =>
  `/${storeId}/${productId || ""}`;

// A naive unique ID generator for new stores and products
const createId = () => Math.random().toString(36).substring(2, 15);

// Helper function to convert the database schema to the API schema for stores
const convertDbStoreSchemaToApiSchema = (store?: DBItem) =>
  store && {
    ...store,
    storeId: store.key.split("/").pop(),
    key: undefined,
    category: undefined,
  };

// Helper function to convert the database schema to the API schema for products
const convertDbProductSchemaToApiSchema = (product?: DBItem) =>
  product && {
    ...product,
    productId: product.key.split("/").pop(),
    key: undefined,
    category: undefined,
  };

// Middleware adds store and product instances read from the database to the request object
interface InventoryRequest extends Request {
  store?: DBItem;
  product?: DBItem;
}

// Middleware to ensure a store exists before proceeding
const ensureStoreExists = async (
  req: InventoryRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const store = await getItem(StoreCategory, getStoreKey(req.params.storeId));
    if (store === undefined) {
      res.status(404).json(createError(404, "Store not found"));
    } else {
      req.store = store;
      next();
    }
  } catch (e) {
    next(e);
  }
};

// Middleware to ensure a product exists before proceeding
const ensureProductExists = async (
  req: InventoryRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await getItem(
      ProductCategory,
      getProductKey(req.params.storeId, req.params.productId)
    );
    if (product === undefined) {
      res.status(404).json(createError(404, "Product not found"));
    } else {
      req.product = product;
      next();
    }
  } catch (e) {
    next(e);
  }
};

// List all stores
router.get("/store", async (req, res, next) => {
  try {
    const dbResult = await listItems(StoreCategory, "/", {
      nextToken: req.query.nextToken as string,
    });
    const stores = dbResult.items.map(convertDbStoreSchemaToApiSchema);
    res.json({ stores, nextToken: dbResult.nextToken });
  } catch (e) {
    next(e);
  }
});

// Create store
router.post("/store", async (req, res, next) => {
  try {
    const storeId = createId();
    await putItem({
      ...req.body,
      category: StoreCategory,
      key: getStoreKey(storeId),
    });
    res.json({ ...req.body, storeId });
  } catch (e) {
    next(e);
  }
});

// Read store
router.get(
  "/store/:storeId",
  ensureStoreExists,
  async (req: InventoryRequest, res) => {
    res.json(convertDbStoreSchemaToApiSchema(req.store));
  }
);

// Update store
router.put("/store/:storeId", ensureStoreExists, async (req, res, next) => {
  try {
    await putItem({
      ...req.body,
      category: StoreCategory,
      key: getStoreKey(req.params.storeId),
    });
    res.json({ ...req.body, storeId: req.params.storeId });
  } catch (e) {
    next(e);
  }
});

// Delete store
router.delete("/store/:storeId", async (req, res, next) => {
  try {
    // Delete all products in the store
    let nextToken: string | undefined;
    do {
      const products = await listItems(
        ProductCategory,
        getProductKey(req.params.storeId),
        { nextToken }
      );
      const deleteProducts = products.items.map((item) =>
        deleteItem(ProductCategory, item.key)
      );
      await Promise.all(deleteProducts);
      nextToken = products.nextToken;
    } while (nextToken);

    // Delete the store itself
    await deleteItem(StoreCategory, getStoreKey(req.params.storeId));
  } catch (e) {
    next(e);
  }

  res.status(204).send();
});

// List all products in a store
router.get(
  "/store/:storeId/product",
  ensureStoreExists,
  async (req, res, next) => {
    try {
      const dbResult = await listItems(
        ProductCategory,
        getProductKey(req.params.storeId),
        {
          nextToken: req.query.nextToken as string,
        }
      );
      const products = dbResult.items.map(convertDbProductSchemaToApiSchema);
      res.json({ products, nextToken: dbResult.nextToken });
    } catch (e) {
      next(e);
    }
  }
);

// Create a product in a store
router.post(
  "/store/:storeId/product",
  ensureStoreExists,
  async (req, res, next) => {
    try {
      const productId = createId();
      await putItem({
        ...req.body,
        category: ProductCategory,
        key: getProductKey(req.params.storeId, productId),
      });
      res.json({ ...req.body, productId });
    } catch (e) {
      next(e);
    }
  }
);

// Read a product in a store
router.get(
  "/store/:storeId/product/:productId",
  ensureStoreExists,
  ensureProductExists,
  async (req: InventoryRequest, res) => {
    res.json(convertDbProductSchemaToApiSchema(req.product));
  }
);

// Update a product in a store
router.put(
  "/store/:storeId/product/:productId",
  ensureStoreExists,
  ensureProductExists,
  async (req: InventoryRequest, res, next) => {
    try {
      await putItem({
        ...req.body,
        category: ProductCategory,
        key: getProductKey(req.params.storeId, req.params.productId),
      });
      res.json({ ...req.body, productId: req.params.productId });
    } catch (e) {
      next(e);
    }
  }
);

// Delete a product in a store
router.delete("/store/:storeId/product/:productId", async (req, res, next) => {
  try {
    await deleteItem(
      ProductCategory,
      getProductKey(req.params.storeId, req.params.productId)
    );
  } catch (e) {
    next(e);
  }

  res.status(204).send();
});

export default router;
