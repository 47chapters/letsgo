import { Router } from "express";
import validateSchema from "../middleware/validateSchema";
import Schema from "../schema";

const router = Router();

router.post("/", validateSchema(Schema.postContact), async (req, res, next) => {
  try {
    const contact = { ...req.body, timestamp: new Date().toISOString() };
    console.log("NEW CONTACT", JSON.stringify(contact, null, 2));
    res.status(200).send();
  } catch (e) {
    next(e);
  }
});

export default router;
