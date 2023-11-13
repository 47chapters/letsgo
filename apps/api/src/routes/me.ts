import {
  Tenant,
  createTenant,
  getTenantsOfIdentity,
  putTenant,
  reconcileSubscriptionStatus,
} from "@letsgo/tenant";
import { GetMeResponse, MessageType, TenantNewMessage } from "@letsgo/types";
import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate";
import { pruneResponse } from "./common";
import { enqueue } from "@letsgo/queue";
import { isBuiltInIssuer } from "@letsgo/trust";
import { JwtPayload } from "jsonwebtoken";

export const meHandler: RequestHandler = async (req, res, next) => {
  try {
    const request = req as AuthenticatedRequest;
    const noTenantProvisioning =
      req.query.noTenantProvisioning !== undefined ||
      // Do not provision tenants for built-in issuers
      isBuiltInIssuer(
        (request.user?.decodedJwt?.payload as JwtPayload).iss || ""
      );
    let tenants = await getTenantsOfIdentity({
      identity: request.user.identity,
    });
    if (tenants.length === 0 && !noTenantProvisioning) {
      // If the user does not belong to any tenants, create a tenant for the user
      const tenant = await createTenant({
        createdBy: request.user.identity,
      });
      // Enqueue worker job to do any additional asynchronous work related to tenant provisioning
      await enqueue({
        type: MessageType.TenantNew,
        payload: { tenant },
      } as TenantNewMessage);
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
