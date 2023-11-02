import { Router } from "express";
import { raw } from "body-parser";
import { validateWebhookEvent } from "@letsgo/stripe";
import createError from "http-errors";
import { enqueue } from "@letsgo/queue";
import { MessageType } from "@letsgo/types";

const router = Router();

router.post(
  "/webhook",
  raw({ type: "application/json" }),
  async (req, res, next) => {
    let event: any;
    try {
      event = await validateWebhookEvent({
        body: req.body,
        signature: req.headers["stripe-signature"] as string,
      });
    } catch (e: any) {
      console.log("INVALID STRIPE WEBHOOK EVENT:", e.message);
      next(createError(400, "Invalid Stripe webhook event"));
      return;
    }
    await enqueue({
      type: MessageType.Stripe,
      payload: event,
    });
    res.status(201).end();
  }
);

export default router;
