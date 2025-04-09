import { SearchIcon } from "lucide-react";
import { IconButton } from "~/components/IconButton";
import { CommandPalette } from "~/components/CommandPalette";
import { useToggleProvider } from "~/components/useToggleProvider";

export const SearchDialogButton = () => {
  const { setOpen, Provider } = useToggleProvider();

  return (
    <Provider>
      <IconButton
        title="Search"
        icon={SearchIcon}
        onClick={() => setOpen(true)}
      />
      <CommandPalette />
    </Provider>
  );
};
