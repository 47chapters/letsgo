import { DBItem } from "@letsgo/db";
import { createTenant } from "@letsgo/tenant";
import { Router } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate";
import validateSchema from "../middleware/validateSchema";
import postTenant from "../schema/postTenant";

export function pruneResponse(item: DBItem) {
  const response: any = { ...item };
  delete response.key;
  delete response.category;
  delete response.ttl;
  return response;
}

const router = Router();

// Create new tenant
router.post(
  "/",
  validateSchema({ body: postTenant }),
  async (req, res, next) => {
    try {
      const request = req as AuthenticatedRequest;
      const tenant = await createTenant({
        creator: request.user.identity,
        displayName: req.body.displayName,
      });
      res.json(pruneResponse(tenant));
    } catch (e) {
      next(e);
    }
  }
);

export default router;
