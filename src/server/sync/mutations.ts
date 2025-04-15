import {
  createChatMutation,
  deleteChatMutation,
  addUserMessageMutation,
  updateChatMutation,
} from "./mutations/chats";
import { setApiKeyMutation, setCurrentModelMutation } from "./mutations/users";

export const mutators = {
  [setApiKeyMutation.mutationName]: setApiKeyMutation,
  [setCurrentModelMutation.mutationName]: setCurrentModelMutation,
  [createChatMutation.mutationName]: createChatMutation,
  [updateChatMutation.mutationName]: updateChatMutation,
  [deleteChatMutation.mutationName]: deleteChatMutation,
  [addUserMessageMutation.mutationName]: addUserMessageMutation,
} as const;

export type MutationNames = keyof typeof mutators;
