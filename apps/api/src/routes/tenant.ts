import { InvitationTtl } from "@letsgo/constants";
import { getPlan } from "@letsgo/pricing";
import {
  cancelSubscription,
  completePaymentSetup,
  createCustomer,
  createNewPaymentSetup,
  createNewSubscription,
  updateSubscription,
} from "@letsgo/stripe";
import {
  addIdentityToTenant,
  createInvitation,
  createTenant,
  deleteInvitation,
  getIdentitiesOfTenant,
  getInvitation,
  getInvitations,
  getTenant,
  putTenant,
  removeIdentityFromTenant,
  setNewPlan,
} from "@letsgo/tenant";
import {
  deserializeIdentity,
  getIdentity,
  serializeIdentity,
} from "@letsgo/trust";
import {
  GetInvitationsResponse,
  GetTenantUsersResponse,
  MessageType,
  TenantNewMessage,
} from "@letsgo/types";
import { Router } from "express";
import createError from "http-errors";
import { AuthenticatedRequest } from "../middleware/authenticate";
import { authorizeTenant } from "../middleware/authorizeTenant";
import validateSchema from "../middleware/validateSchema";
import Schema from "../schema";
import { createAbsoluteWebUrl, pruneResponse } from "./common";
import { enqueue } from "@letsgo/queue";

const router = Router();

// Create new tenant
router.post("/", validateSchema(Schema.postTenant), async (req, res, next) => {
  try {
    const request = req as AuthenticatedRequest;
    const tenant = await createTenant({
      createdBy: request.user.identity,
      displayName: req.body.displayName,
    });
    // Enqueue worker job to do any additional asynchronous work related to tenant provisioning
    await enqueue({
      type: MessageType.TenantNew,
      payload: { tenant },
    } as TenantNewMessage);

    res.json(pruneResponse(tenant));
  } catch (e) {
    next(e);
  }
});

// Initiate change of the tenant's payment method
router.post(
  "/:tenantId/paymentmethod",
  authorizeTenant(),
  async (req, res, next) => {
    try {
      const { tenantId } = req.params;

      // Determine current tenant and Stripe parameters
      const tenant = await getTenant({ tenantId });
      if (!tenant) {
        next(createError(404, "Tenant not found"));
        return;
      }
      const customerId = tenant.plan.stripeCustomerId;
      const subscriptionId = tenant.plan.stripeSubscription?.subscriptionId;
      if (!customerId || !subscriptionId) {
        next(
          createError(
            400,
            `Tenant ${tenantId} does not have a Stripe subscription`
          )
        );
        return;
      }

      // Create a new payment setup
      const response = await createNewPaymentSetup({
        customerId,
      });
      res.json({
        ...response,
        subscriptionId,
        customerId,
      });
    } catch (e) {
      next(e);
    }
  }
);

// Complete the change of the tenant's payment method. This endpoint is called
// by the browser when Stripe redirects the user back to the app after the
// payment intent setup flow (started in the HTTP POST to the same URL) is completed.
router.get(
  "/:tenantId/paymentmethod",
  authorizeTenant(),
  validateSchema(Schema.getPaymentMethod),
  async (req, res, next) => {
    try {
      const request = req as AuthenticatedRequest;
      const { tenantId } = req.params;
      const identityId = request.user.identityId;
      const { setup_intent: setupIntentId } = req.query;

      // Determine current tenant and Stripe parameters
      const tenant = await getTenant({ tenantId });
      if (!tenant) {
        next(createError(404, "Tenant not found"));
        return;
      }
      const customerId = tenant.plan.stripeCustomerId;
      const subscriptionId = tenant.plan.stripeSubscription?.subscriptionId;
      if (!customerId || !subscriptionId) {
        next(
          createError(
            400,
            `Tenant ${tenantId} does not have a Stripe subscription`
          )
        );
        return;
      }

      // Process completed setup intent. If successful, the customer and subscription will
      // be updated with the new payment method.
      const response = await completePaymentSetup({
        setupIntentId: setupIntentId as string,
        customerId,
        subscriptionId,
      });

      // Update tenant with new payment method
      if (
        response.status === "succeeded" &&
        response.card &&
        tenant.plan.stripeSubscription &&
        (tenant.plan.stripeSubscription?.card?.brand !== response.card.brand ||
          tenant.plan.stripeSubscription?.card?.last4 !== response.card.last4)
      ) {
        tenant.plan.stripeSubscription = {
          ...tenant.plan.stripeSubscription,
          card: response.card,
        };
        await putTenant(tenant);
      }

      // Redirect the browser back to the dashboard with appropriate next step
      let location: string;
      if (response.status === "succeeded") {
        location = createAbsoluteWebUrl(`/manage/${tenantId}/settings`);
      } else if (response.status === "processing") {
        location = createAbsoluteWebUrl(
          `/manage/${tenantId}/paymentmethod/processing`
        );
      } else {
        location = createAbsoluteWebUrl(
          `/manage/${tenantId}/paymentmethod?status=failed`
        );
      }

      res.redirect(location);
    } catch (e) {
      next(e);
    }
  }
);

// Initiate change of the tenant's plan
router.post(
  "/:tenantId/plan",
  authorizeTenant(),
  validateSchema(Schema.postPlan),
  async (req, res, next) => {
    try {
      const request = req as AuthenticatedRequest;
      const { tenantId } = req.params;
      const identityId = request.user.identityId;
      const { planId: newPlanId, email, name } = req.body;

      // Determine the current plan of the tenant
      const tenant = await getTenant({ tenantId });
      if (!tenant) {
        next(createError(404, "Tenant not found"));
        return;
      }
      const currentPlanId = tenant.plan.planId;
      if (currentPlanId === newPlanId) {
        res.status(204).send();
        return;
      }

      // Determine if current and new plans use Stripe
      const isCurrentPlanStripe = getPlan(currentPlanId)?.usesStripe || false;
      const isNewPlanStripe = getPlan(newPlanId)?.usesStripe || false;

      // Create customer in Stripe if needed
      if (isNewPlanStripe && !tenant.plan.stripeCustomerId) {
        const customer = await createCustomer({
          tenantId,
          identityId,
          name,
          email,
        });
        tenant.plan.stripeCustomerId = customer.id;
        await putTenant(tenant);
      }

      if (isCurrentPlanStripe) {
        // current plan is Stripe
        if (isNewPlanStripe) {
          // current plan is Stripe, new plan is Stripe
          const response = await updateSubscription({
            subscriptionId: tenant.plan.stripeSubscription
              ?.subscriptionId as string,
            identityId,
            priceLookupKey: newPlanId,
          });
          tenant.plan.stripeSubscription = {
            ...tenant.plan.stripeSubscription,
            ...response,
          };
          // changes to existing Stripe subscriptions are immediate
          setNewPlan(tenant, newPlanId, request.user.identity);
          await putTenant(tenant);
          res.status(204).send();
          return;
        } else {
          // current plan is Stripe, new plan is not Stripe
          const response = await cancelSubscription({
            subscriptionId: tenant.plan.stripeSubscription
              ?.subscriptionId as string,
            identityId,
          });
          // changes to existing Stripe subscriptions are immediate
          setNewPlan(tenant, newPlanId, request.user.identity);
          delete tenant.plan.stripeSubscription;
          await putTenant(tenant);
          res.status(204).send();
          return;
        }
      } else {
        // current plan is not Stripe
        if (isNewPlanStripe) {
          // current plan is not Stripe, new plan is Stripe
          const response = await createNewSubscription({
            customerId: tenant.plan.stripeCustomerId as string,
            tenantId,
            identityId,
            priceLookupKey: newPlanId,
          });
          tenant.plan.stripeSubscription = {
            subscriptionId: response.subscriptionId,
            status: response.status,
            currentPeriodEnd: response.currentPeriodEnd,
            // No card number yet, it will be created next
          };
          await putTenant(tenant);
          res.json(response);
          return;
        } else {
          // current plan is not Stripe, new plan is not Stripe
          setNewPlan(tenant, newPlanId, request.user.identity);
          await putTenant(tenant);
          res.status(204).send();
          return;
        }
      }
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
