import { useState } from "react";
import { EllipsisIcon, PenIcon, TrashIcon } from "lucide-react";
import { ChatViewModel } from "~/shared/ChatViewModel";
import { Dropdown } from "~/components/Dropdown";
import { Icon } from "~/components/Icon";
import { DeleteChatAlertDialog } from "./DeleteChatAlertDialog";
import clsx from "clsx";

export function NavChatListMenu({
  chat,
  onEditMode,
}: {
  chat: ChatViewModel;
  onEditMode(): void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <Dropdown
        open={showMenu}
        onOpenChange={setShowMenu}
        trigger={
          <button
            className={clsx(
              "relative",
              "opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-lg",
              { "!opacity-100": showMenu },
              "p-1 -m-1 aspect-square",
            )}
          >
            <Icon as={EllipsisIcon} />
          </button>
        }
        items={[
          {
            children: (
              <>
                <Icon as={PenIcon} size="small" /> Rename
              </>
            ),
            onClick: onEditMode,
          },
          {
            variant: "danger",
            children: (
              <>
                <Icon as={TrashIcon} size="small" className="!text-current" />{" "}
                Delete
              </>
            ),
            onClick: () => setShowDeleteDialog(true),
          },
        ]}
      />
      <DeleteChatAlertDialog
        chat={chat}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
