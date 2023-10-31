import {
  Tenant,
  createTenant,
  getTenantsOfIdentity,
  putTenant,
  reconcileSubscriptionStatus,
} from "@letsgo/tenant";
import { GetMeResponse } from "@letsgo/types";
import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate";
import { pruneResponse } from "./common";

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
      // Update Stripe subscription status
      const reconciledTenants: Tenant[] = [];
      for (const tenant of tenants) {
        const updatedTenant = await reconcileSubscriptionStatus(
          tenant,
          request.user.identity
        );
        if (updatedTenant) {
          await putTenant(updatedTenant);
        }
        reconciledTenants.push(updatedTenant || tenant);
      }
      tenants = reconciledTenants.map(pruneResponse);
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
