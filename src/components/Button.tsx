import { ComponentProps } from "react";
import clsx from "clsx";

export function Button({
  variant = "default",
  className,
  ...props
}: {
  variant?: "default" | "secondary" | "danger";
} & ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={clsx(
        "border py-2 px-3.5 rounded-full text-sm transition-colors",
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
