import { ComponentProps, ReactNode } from "react";
import { DropdownMenu } from "radix-ui";
import clsx from "clsx";

export function Dropdown({
  trigger,
  items,
  ...props
}: {
  trigger: ReactNode;
  items: Array<{
    children: ReactNode;
    onClick: () => void;
    variant?: "default" | "danger";
  }>;
} & ComponentProps<typeof DropdownMenu.Root>) {
  return (
    <DropdownMenu.Root {...props}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="rounded-xl bg-white border border-gray-200 shadow-lg p-2">
          {items.map(({ children, onClick, variant = "default" }, index) => (
            <DropdownMenu.Item
              key={index}
              onClick={onClick}
              className={clsx(
                "hover:outline-0 cursor-pointer text-sm",
                "flex items-center gap-3",
                "p-2 bg-transparent hover:bg-gray-100 rounded-md transition-colors",
                {
                  "text-red-600": variant === "danger",
                },
              )}
            >
              {children}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
