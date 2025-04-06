import { useReplicache, useSubscribe } from "~/components/Replicache";
import { UserViewModel } from "~/shared/UserViewModel";

export const USERS_PREFIX = "users/";
export const userPrefix = (id: string) => `${USERS_PREFIX}${id}`;

export function useUser() {
  const r = useReplicache();
  return useSubscribe(
    r,
    async (tx) => {
      const users = await tx
        .scan<UserViewModel>({ prefix: USERS_PREFIX, limit: 1 })
        .values()
        .toArray();
      if (users.length === 0) return null;
      return users[0] as UserViewModel;
    },
    {
      default: null,
      dependencies: [r],
    },
  );
}
