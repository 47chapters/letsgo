import { createJwt } from "@letsgo/trust";
import { VendorPrefix } from "@letsgo/constants";

const DefaultWorkerAccessTokenExpiry = 3600;
const RenewBeforeExpirySeconds = 60;
const WorkerSubject = `${VendorPrefix}:worker`;

let renewAt: number = 0;
let token: string = "";

/**
 * Creates a JWT access token for the worker to call the APIs with. The token is cached for 1 hour, and renewed 1 minute
 * before expiry. The token is issued by the default PKI issuer registered in the system.
 * @returns A JWT access token
 */
export async function getAccessToken() {
  if (renewAt < Date.now()) {
    token = await createJwt({
      expiresIn: `${DefaultWorkerAccessTokenExpiry}`,
      subject: WorkerSubject,
    });
    renewAt =
      Date.now() +
      (DefaultWorkerAccessTokenExpiry - RenewBeforeExpirySeconds) * 1000;
  }
  return token;
}
