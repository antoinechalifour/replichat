import {
  createChat,
  updateChat,
  deleteChat,
  sendMessage,
} from "./mutations/chats";

export const mutators = {
  [createChat.mutationName]: createChat,
  [updateChat.mutationName]: updateChat,
  [deleteChat.mutationName]: deleteChat,
  [sendMessage.mutationName]: sendMessage,
} as const;

export type MutationNames = keyof typeof mutators;
