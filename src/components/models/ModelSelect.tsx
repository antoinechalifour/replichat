import { DropdownMenu } from "radix-ui";
import { useModels } from "~/client/models";
import { Icon } from "~/components/Icon";
import { ChevronDownIcon } from "lucide-react";

export function ModelSelect() {
  const models = useModels();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="text-lg font-semibold text-gray-500 px-3 rounded-lg py-1.5 bg-transparent hover:bg-gray-100 transition-colors flex items-center gap-2">
          GPT 4o <Icon as={ChevronDownIcon} />
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
