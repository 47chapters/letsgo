import { putIdentity } from "@letsgo/trust";
import { Router } from "express";
import { authorizeIdentity } from "../middleware/authorizeIdentity";

const router = Router();

// Save the OpenId profile of the identity
router.put("/:identityId", authorizeIdentity(), async (req, res, next) => {
  try {
    await putIdentity({ identityId: req.params.identityId, user: req.body });
    res.end();
  } catch (e) {
    next(e);
  }
});

export default router;
