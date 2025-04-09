import { PropsWithChildren } from "react";
import { Tooltip } from "radix-ui";

export function Hint({ children, text }: PropsWithChildren<{ text: string }>) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white">
          {text}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
