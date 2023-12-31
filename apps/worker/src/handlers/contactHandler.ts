import { ContactMessage, Message } from "@letsgo/types";
import { MessageHandler } from "./index";
import { sendSlackMessage } from "@letsgo/slack";

export const contactHandler: MessageHandler<Message> = async (
  message,
  event,
  context
) => {
  const contact = (message as ContactMessage).payload;

  console.log("CONTACT FORM SUBMISSION", message);

  const text = [
    `:wave: New contact form submission`,
    `*Name:* ${contact.name}`,
    `*Email:* ${contact.email}`,
    `*Timestamp:* ${contact.timestamp}`,
  ];
  if (contact.tenantId) {
    text.push(`*Tenant Id:* ${contact.tenantId}`);
  }
  if (contact.identityId) {
    text.push(`*Identity Id:* ${contact.identityId}`);
  }
  Object.entries(contact.query).forEach(([key, value]) => {
    text.push(`*${key}:* ${value}`);
  });
  text.push(`*Message:*`);
  text.push(contact.message);

  await sendSlackMessage(text.join("\n"));
};
