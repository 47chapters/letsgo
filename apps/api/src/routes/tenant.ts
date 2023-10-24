import { createTenant, getIdentitiesOfTenant } from "@letsgo/tenant";
import { Router } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate";
import validateSchema from "../middleware/validateSchema";
import postTenant from "../schema/postTenant";
import { authorizeTenant } from "../middleware/authorizeTenant";
import { getIdentity, serializeIdentity } from "@letsgo/trust";
import { pruneResponse } from "./common";
import { GetTenantUsersResponse } from "@letsgo/types";

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

// Get all identities associated with a tenant
router.get("/:tenantId/user", authorizeTenant(), async (req, res, next) => {
  const { details } = req.query;
  try {
    const response = await getIdentitiesOfTenant({
      tenantId: req.params.tenantId,
    });
    const identities: any[] = response.map((i) => ({
      ...i,
      identityId: serializeIdentity(i),
    }));
    if (details !== undefined) {
      for (const identity of identities) {
        identity.user = (
          await getIdentity({ identityId: identity.identityId })
        )?.user;
      }
    }
    const body: GetTenantUsersResponse = { identities };
    res.json(body);
  } catch (e) {
    next(e);
  }
});

export default router;
