import { SearchIcon } from "lucide-react";
import { IconButton } from "~/components/IconButton";
import { CommandPalette } from "~/components/CommandPalette";
import { useToggleProvider } from "~/components/useToggleProvider";
import { Hint } from "~/components/Hint";

export const SearchDialogButton = () => {
  const { setOpen, Provider } = useToggleProvider();

  return (
    <Provider>
      <Hint text="Search (⌘K)">
        <IconButton
          title="Search"
          icon={SearchIcon}
          onClick={() => setOpen(true)}
        />
      </Hint>
      <CommandPalette />
    </Provider>
  );
};
