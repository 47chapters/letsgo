import { Message, MessageType } from "@letsgo/types";
import { Context, SQSEvent } from "aws-lambda";
import { contactHandler } from "./contactHandler";
import { tenantNewHandler } from "./tenantNewHandler";
import { tenantDeletedHandler } from "./tenantDeletedHandler";
import { stripeHandler } from "./stripeHandler";
import { sendSlackMessage } from "@letsgo/slack";

export type MessageHandler<T> = (
  message: T,
  event: SQSEvent,
  context: Context
) => Promise<void>;

export const unrecognizedMessageTypeHandler: MessageHandler<Message> = async (
  message,
  event,
  context
) => {
  console.log("UNSUPPORTED MESSAGE TYPE, IGNORING", message);
  await sendSlackMessage(
    `:warning: Worker received an unsupported message type (ignoring): '${message.type}'`
  );
};

export const handlers: { [type: string]: MessageHandler<Message> } = {
  [MessageType.Contact]: contactHandler,
  [MessageType.TenantNew]: tenantNewHandler,
  [MessageType.TenantDeleted]: tenantDeletedHandler,
  [MessageType.Stripe]: stripeHandler,
};
