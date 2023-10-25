import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate";
import { getTenantsOfIdentity, createTenant } from "@letsgo/tenant";
import { pruneResponse } from "./common";
import { GetMeResponse } from "@letsgo/types";

export const meHandler: RequestHandler = async (req, res, next) => {
  try {
    const request = req as AuthenticatedRequest;
    const noTenantProvisioning = req.query.noTenantProvisioning !== undefined;
    let tenants = await getTenantsOfIdentity({
      identity: request.user.identity,
    });
    if (tenants.length === 0 && !noTenantProvisioning) {
      // If the user does not belong to any tenants, create a tenant for the user
      const tenant = await createTenant({
        createdBy: request.user.identity,
      });
      tenants.push(pruneResponse(tenant));
    } else {
      tenants = tenants.map(pruneResponse);
    }
    const body: GetMeResponse = {
      identityId: request.user.identityId,
      identity: request.user.identity,
      tenants,
    };
    return res.json(body);
  } catch (e: any) {
    return next(e);
  }
};
