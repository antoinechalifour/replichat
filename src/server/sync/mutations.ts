import {
  createChat,
  deleteChat,
  sendMessage,
  updateChat,
} from "./mutations/chats";
import { setApiKey } from "./mutations/users";

export const mutators = {
  [setApiKey.mutationName]: setApiKey,
  [createChat.mutationName]: createChat,
  [updateChat.mutationName]: updateChat,
  [deleteChat.mutationName]: deleteChat,
  [sendMessage.mutationName]: sendMessage,
} as const;

export type MutationNames = keyof typeof mutators;
