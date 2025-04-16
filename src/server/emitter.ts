import { EventEmitter } from "node:events";
import TypedEmitter from "typed-emitter";
import { generateChatName } from "~/server/chats/GenerateChatName";
import { MessageRole } from "./chats/Chat";
import { generateSystemMessage } from "~/server/chats/GenerateSystemMessage";
import { poke } from "~/server/pusher";

type Events = {
  "chat.created": (args: { chatId: string; userId: string }) => void;
  "chat.message.created": (args: {
    chatId: string;
    userId: string;
    messageId: string;
    role: MessageRole;
  }) => void;
};

export const emitter = new EventEmitter() as TypedEmitter<Events>;

emitter.on("chat.created", (args) => {
  void generateChatName(args.userId, args.chatId);
});

emitter.on("chat.message.created", (args) => {
  if (args.role !== "USER") return;
  return generateSystemMessage.execute({
    chatId: args.chatId,
    userId: args.userId,
  });
});

emitter.on("chat.message.created", (args) => {
  poke(args.userId);
});
