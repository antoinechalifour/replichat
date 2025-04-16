import { Drawer } from "vaul";
import { Icon } from "~/components/Icon";
import { EqualIcon } from "lucide-react";
import { NavbarContent } from "~/components/Navbar";
import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";

export function DrawerMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <Drawer.Root direction="left" open={open} onOpenChange={setOpen}>
      <Drawer.Trigger className="p-3 -m-3">
        <Icon as={EqualIcon} />
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0" />
        <Drawer.Content className="left-0 top-0 bottom-0 fixed z-10 outline-none w-[260px] flex">
          <div className="bg-white border-r border-gray-200 shadow-2xl h-full w-full grow flex flex-col">
            <NavbarContent />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
