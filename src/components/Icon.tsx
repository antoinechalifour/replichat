import { ComponentType } from "react";
import { LucideProps } from "lucide-react";
import clsx from "clsx";

export const Icon = ({
  as: AsComponent,
  className,
  size = "default",
  ...props
}: {
  as: ComponentType<LucideProps>;
  size?: "small" | "default";
} & LucideProps) => {
  return (
    <AsComponent
      {...props}
      width={20}
      className={clsx("text-gray-600", className, {
        "w-4 h-4": size === "small",
        "w-5 h-5": size === "default",
      })}
    />
  );
};
