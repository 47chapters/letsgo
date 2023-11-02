import { Message } from "@letsgo/types";
import { MessageHandler } from "./index";
import {
  handlers,
  unrecognizedStripeMessageTypeHandler,
  StripeMessage,
} from "./stripeHandlers";

export const stripeHandler: MessageHandler<Message> = async (
  message,
  event,
  context
) => {
  const stripeMessage = message.payload as StripeMessage<any>;
  const handler =
    handlers[stripeMessage.type] || unrecognizedStripeMessageTypeHandler;
  return handler(stripeMessage, event, context);
};
