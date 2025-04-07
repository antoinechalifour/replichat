import { ComponentProps, ComponentType } from "react";
import { LucideProps } from "lucide-react";
import { Icon } from "~/components/Icon";
import clsx from "clsx";

export function IconButton({
  title,
  icon: IconComponent,
  variant = "squared",
  ...props
}: {
  title: string;
  variant?: "squared" | "rounded";
  icon: ComponentType<LucideProps>;
} & ComponentProps<"button">) {
  return (
    <button
      title={title}
      {...props}
      className={clsx(
        "p-2 bg-transparent transition-colors hover:bg-gray-200",
        {
          "rounded-md": variant === "squared",
          "rounded-full": variant === "rounded",
        },
      )}
    >
      <Icon as={IconComponent} />
    </button>
  );
}
