export type MessageRole = "USER" | "SYSTEM";

export class Message {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly role: MessageRole,
  ) {}
}

export type ChatUpdates = {
  title: string;
};

export class Chat {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public readonly messages: Message[],
  ) {}

  addMessage(args: { id: string; role: MessageRole; message: string }) {
    if (this.lastMessageAddedBy(args.role)) throw new Error(`Invalid role`);

    this.messages.push(new Message(args.id, args.message, args.role));
  }

  private lastMessageAddedBy(role: MessageRole) {
    const lastMessage = this.messages.at(-1);
    if (!lastMessage) return false;
    return lastMessage.role === role;
  }

  applyUpdates(updates: ChatUpdates) {
    this.title = updates.title;
  }
}
