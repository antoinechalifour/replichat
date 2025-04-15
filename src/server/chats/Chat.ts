export type MessageRole = "USER" | "SYSTEM";

export class Message {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly role: MessageRole,
  ) {}
}

export class Chat {
  constructor(
    public readonly id: string,
    public readonly messages: Message[],
  ) {}

  addMessage(args: { role: MessageRole; message: string }) {
    if (this.lastMessageAddedBy(args.role)) throw new Error(`Invalid role`);

    this.messages.push(
      new Message(crypto.randomUUID(), args.message, args.role),
    );
  }

  private lastMessageAddedBy(role: MessageRole) {
    const lastMessage = this.messages.at(-1);
    if (!lastMessage) return false;
    return lastMessage.role === role;
  }
}
