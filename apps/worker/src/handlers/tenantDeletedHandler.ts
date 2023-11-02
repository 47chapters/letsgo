import { TenantDeletedMessage } from "@letsgo/types";
import { MessageHandler } from "./index";
import { sendSlackMessage } from "@letsgo/slack";
import { Identity, serializeIdentity } from "@letsgo/trust";

export const tenantDeletedHandler: MessageHandler = async (
  message,
  event,
  context
) => {
  const { tenant, cancelledPlanId } = (message as TenantDeletedMessage).payload;

  console.log(
    "DELETED TENANT",
    JSON.stringify({ tenant, cancelledPlanId }, null, 2)
  );

  const text = [
    `:cry: Tenant deleted`,
    `*Tenant Id:* ${tenant.tenantId}`,
    `*Name:* ${tenant.displayName}`,
    `*Plan Id:* ${cancelledPlanId || tenant.plan.planId}`,
    `*Created by:* ${serializeIdentity(tenant.createdBy)}`,
    `*Deleted by:* ${serializeIdentity(tenant.deletedBy as Identity)}`,
    `*Timestamp:* ${tenant.deletedAt as string}`,
  ];

  await sendSlackMessage(text.join("\n"));
};
