export type ChatMessageViewModel = {
  id: string;
  content: string;
  role: "USER" | "SYSTEM";
  createdAt: string;
  synced: boolean;
};
