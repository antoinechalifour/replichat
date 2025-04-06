import { useReplicache, useSubscribe } from "~/components/Replicache";
import { UserViewModel } from "~/shared/UserViewModel";

export function useUser() {
  const r = useReplicache();
  return useSubscribe(
    r,
    async (tx) => {
      const users = await tx
        .scan<UserViewModel>({ prefix: "users/", limit: 1 })
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
