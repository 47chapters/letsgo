import { Router } from "express";
import validateSchema from "../middleware/validateSchema";
import Schema from "../schema";
import { ContactMessage, MessageType } from "@letsgo/types";
import { enqueue } from "@letsgo/queue";

const router = Router();

router.post("/", validateSchema(Schema.postContact), async (req, res, next) => {
  try {
    const message: ContactMessage = {
      type: MessageType.Contact,
      payload: req.body,
    };
    await enqueue(message);
    res.status(200).send();
  } catch (e) {
    next(e);
  }
});

export default router;
