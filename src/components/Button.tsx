import { ComponentProps } from "react";
import clsx from "clsx";

export function Button({
  variant = "default",
  size = "default",
  className,
  ...props
}: {
  variant?: "default" | "secondary" | "danger";
  size?: "lg" | "default";
} & ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={clsx(
        "border rounded-full transition-colors inline-flex gap-2 items-center",
        {
          "py-2 px-3.5 text-sm": size === "default",
          "py-3 px-5 text-base": size === "lg",
        },
        {
          "border-gray-200": variant === "secondary",
          "bg-red-500 text-white border-red-500": variant === "danger",
          "disabled:bg-gray-700 bg-gray-900 hover:bg-gray-700 text-white border-gray-900":
            variant === "default",
        },
        className,
      )}
    />
  );
}
