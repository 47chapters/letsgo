import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate";
import { getTenantsOfIdentity, createTenant } from "@letsgo/tenant";
import { pruneResponse } from "./tenant";

export const meHandler: RequestHandler = async (req, res, next) => {
  try {
    const request = req as AuthenticatedRequest;
    let tenants = await getTenantsOfIdentity({
      identity: request.user.identity,
    });
    if (tenants.length === 0) {
      // If the user does not belong to any tenants, create a tenant for the user
      const tenant = await createTenant({
        creator: request.user.identity,
      });
      tenants.push(pruneResponse(tenant));
    } else {
      tenants = tenants.map(pruneResponse);
    }
    return res.json({
      identityId: request.user.identityId,
      identity: request.user.identity,
      tenants,
    });
  } catch (e: any) {
    return next(e);
  }
};
