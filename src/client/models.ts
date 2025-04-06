import { useReplicache, useSubscribe } from "~/components/Replicache";
import { ModelViewModel } from "~/shared/ModelViewModel";

export function useModels() {
  const r = useReplicache();
  return useSubscribe(
    r,
    async (tx) => {
      const models = await tx
        .scan<ModelViewModel>({ prefix: "models/" })
        .values()
        .toArray();

      return models as ModelViewModel[];
    },
    { default: [], dependencies: [r] },
  );
}
