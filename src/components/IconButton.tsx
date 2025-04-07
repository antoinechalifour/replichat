import { ComponentProps, ComponentType } from "react";
import { LucideProps } from "lucide-react";
import { Icon } from "~/components/Icon";

export function IconButton({
  title,
  icon: IconComponent,
  ...props
}: {
  title: string;
  icon: ComponentType<LucideProps>;
} & ComponentProps<"button">) {
  return (
    <button
      title={title}
      {...props}
      className="p-2 bg-transparent transition-colors hover:bg-gray-200 rounded-md"
    >
      <Icon as={IconComponent} />
    </button>
  );
}
