import { Message, MessageType } from "@letsgo/types";
import { Context, SQSEvent } from "aws-lambda";
import { contactHandler } from "./contactHandler";
import { tenantNewHandler } from "./tenantNewHandler";

export type MessageHandler = (
  message: Message,
  event: SQSEvent,
  context: Context
) => Promise<void>;

export const handlers: { [type: string]: MessageHandler } = {
  [MessageType.Contact]: contactHandler,
  [MessageType.TenantNew]: tenantNewHandler,
};
