import {
  addIdentityToTenant,
  createInvitation,
  createTenant,
  deleteInvitation,
  getIdentitiesOfTenant,
  getInvitation,
  getInvitations,
  getTenant,
  removeIdentityFromTenant,
} from "@letsgo/tenant";
import { Router } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate";
import validateSchema from "../middleware/validateSchema";
import postTenant from "../schema/postTenant";
import { authorizeTenant } from "../middleware/authorizeTenant";
import {
  deserializeIdentity,
  getIdentity,
  serializeIdentity,
} from "@letsgo/trust";
import { pruneResponse } from "./common";
import { GetInvitationsResponse, GetTenantUsersResponse } from "@letsgo/types";
import { InvitationTtl } from "@letsgo/constants";
import createError from "http-errors";

const router = Router();

// Create new tenant
router.post(
  "/",
  validateSchema({ body: postTenant }),
  async (req, res, next) => {
    try {
      const request = req as AuthenticatedRequest;
      const tenant = await createTenant({
        createdBy: request.user.identity,
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

// Remove an identity from tenant
router.delete(
  "/:tenantId/user/:identityId",
  authorizeTenant(),
  async (req, res, next) => {
    try {
      const response = await getIdentitiesOfTenant({
        tenantId: req.params.tenantId,
      });
      if (
        !response.find((i) => serializeIdentity(i) === req.params.identityId)
      ) {
        next(createError(404, "Identity not found"));
        return;
      }
      if (response.length === 1) {
        next(createError(400, "Cannot remove the last identity from a tenant"));
        return;
      }
      const identity = deserializeIdentity(req.params.identityId);
      await removeIdentityFromTenant({
        tenantId: req.params.tenantId,
        identity,
      });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

// Create an invitation to join the tenant
router.post(
  "/:tenantId/invitation",
  authorizeTenant(),
  async (req, res, next) => {
    try {
      const request = req as AuthenticatedRequest;
      const invitation = await createInvitation({
        createdBy: request.user.identity,
        tenantId: req.params.tenantId,
        ttl: Math.floor(Date.now() / 1000) + InvitationTtl,
      });
      res.json(pruneResponse(invitation));
    } catch (e) {
      next(e);
    }
  }
);

// Get active invitations to join the tenant
router.get(
  "/:tenantId/invitation",
  authorizeTenant(),
  async (req, res, next) => {
    try {
      const invitations = await getInvitations({
        tenantId: req.params.tenantId,
      });
      const response: GetInvitationsResponse = {
        invitations: invitations.map(pruneResponse),
      };
      res.json(response);
    } catch (e) {
      next(e);
    }
  }
);

// Delete invitation to join a tenant
router.delete(
  "/:tenantId/invitation/:invitationId",
  authorizeTenant(),
  async (req, res, next) => {
    try {
      await deleteInvitation({
        tenantId: req.params.tenantId,
        invitationId: req.params.invitationId,
      });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

// Accept an invitation by adding the caller to the tenant
router.post(
  "/:tenantId/invitation/:invitationId/accept",
  async (req, res, next) => {
    try {
      const request = req as unknown as AuthenticatedRequest;
      console.log("POST ACCEPT", { params: req.params, user: request.user });
      const invitation = await getInvitation({
        tenantId: req.params.tenantId,
        invitationId: req.params.invitationId,
      });
      console.log("INVITATION", invitation);
      if (!invitation) {
        next(createError(404, "Invitation not found or expired"));
        return;
      }
      const tenant = await getTenant({ tenantId: req.params.tenantId });
      console.log("TENANT", tenant);
      if (!tenant) {
        next(createError(404, "Tenant not found"));
        return;
      }
      await addIdentityToTenant({
        tenantId: req.params.tenantId,
        identity: request.user.identity,
      });
      await deleteInvitation({
        tenantId: req.params.tenantId,
        invitationId: req.params.invitationId,
      });
      res.status(200).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
