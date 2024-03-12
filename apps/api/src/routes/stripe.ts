import { RequestHandler, Router } from "express";
import { raw } from "body-parser";
import { StripeMode, validateWebhookEvent } from "@letsgo/stripe";
import createError from "http-errors";
import { enqueue } from "@letsgo/queue";
import { MessageType } from "@letsgo/types";

const router = Router();

const stripeHandler: (mode: StripeMode) => RequestHandler =
  (mode: StripeMode) => async (req, res, next) => {
    let event: any;
    try {
      event = await validateWebhookEvent({
        body: req.body,
        signature: req.headers["stripe-signature"] as string,
        mode,
      });
    } catch (e: any) {
      console.log(`INVALID ${mode} STRIPE WEBHOOK EVENT:`, e.message);
      next(createError(400, "Invalid Stripe webhook event"));
      return;
    }
    await enqueue({
      type: MessageType.Stripe,
      payload: {
        ...event,
        stripeMode: mode,
      },
    });
    res.status(201).end();
  };

router.post(
  "/webhook/live",
  raw({ type: "application/json" }),
  stripeHandler("LIVE")
);

router.post(
  "/webhook/test",
  raw({ type: "application/json" }),
  stripeHandler("TEST")
);

export default router;
