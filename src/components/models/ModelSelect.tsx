import { DropdownMenu } from "radix-ui";
import { useModels } from "~/client/models";
import { Icon } from "~/components/Icon";
import { ChevronDownIcon } from "lucide-react";
import { useReplicache } from "~/components/Replicache";
import { UserViewModel } from "~/shared/UserViewModel";

export function ModelSelect({ user }: { user: UserViewModel }) {
  const r = useReplicache();
  const models = useModels();
  const model = models.find((model) => model.id === user.currentModelId);
  if (model == null) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="text-lg font-semibold text-gray-500 px-3 rounded-lg py-1.5 bg-transparent hover:bg-gray-100 transition-colors flex items-center gap-2">
          {model.name}{" "}
          <Icon as={ChevronDownIcon} className="text-gray-400/80" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="border border-gray-200 shadow-lg pt-3 pb-2 px-6 min-w-80 bg-white rounded-2xl"
        >
          <header className="text-sm text-gray-400 mb-1">Models</header>
          {models.map((model) => (
            <DropdownMenu.Item
              key={model.id}
              className="flex flex-col -mx-4 px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition-colors outline-0 cursor-pointer"
              onClick={() => {
                return r.mutate.setCurrentModel({
                  userId: user.id,
                  modelId: model.id,
                });
              }}
            >
              <span className="text-sm text-gray-700">{model.code}</span>
              <span className="text-xs text-gray-500">{model.description}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
