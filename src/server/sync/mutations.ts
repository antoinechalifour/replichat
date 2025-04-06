import {
  createChat,
  deleteChat,
  sendMessage,
  updateChat,
} from "./mutations/chats";
import { setApiKey, setCurrentModel } from "./mutations/users";

export const mutators = {
  [setApiKey.mutationName]: setApiKey,
  [setCurrentModel.mutationName]: setCurrentModel,
  [createChat.mutationName]: createChat,
  [updateChat.mutationName]: updateChat,
  [deleteChat.mutationName]: deleteChat,
  [sendMessage.mutationName]: sendMessage,
} as const;

export type MutationNames = keyof typeof mutators;
