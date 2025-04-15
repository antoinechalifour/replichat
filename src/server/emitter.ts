import { EventEmitter } from "node:events";
import TypedEmitter from "typed-emitter";
import { generateChatName } from "~/server/chats/GenerateChatName";

type Events = {
  "chat.created": (args: { chatId: string; userId: string }) => void;
};

export const emitter = new EventEmitter() as TypedEmitter<Events>;

emitter.on("chat.created", (args) => {
  void generateChatName(args.userId, args.chatId);
});
