import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../middleware/authenticate";
import { JwtPayload } from "jsonwebtoken";
import { getTenantsOfIdentity, createTenant } from "@letsgo/tenant";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  Config,
} from "unique-names-generator";

const nameGeneratorConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: " ",
  style: "capital",
  length: 3,
};

export const meHandler: RequestHandler = async (req, res, next) => {
  try {
    const request = req as AuthenticatedRequest;
    const tenants = await getTenantsOfIdentity({
      identity: request.user.identity,
    });
    if (tenants.length === 0) {
      // If the user does not belong to any tenants, create a tenant for the user
      const tenant = await createTenant({
        creator: request.user.identity,
        displayName: uniqueNamesGenerator(nameGeneratorConfig),
      });
      tenants.push(tenant);
    }
    return res.json({
      identityId: request.user.identityId,
      identity: request.user.identity,
      tenants,
    });
  } catch (e: any) {
    return next(e);
  }
};
