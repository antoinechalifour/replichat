import { ComponentProps } from "react";
import clsx from "clsx";

export function Button({
  variant,
  className,
  ...props
}: { variant: "secondary" | "danger" } & ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={clsx(
        "border py-2 px-3.5 rounded-full text-sm",
        {
          "border-gray-200": variant === "secondary",
          "bg-red-500 text-white border-red-500": variant === "danger",
        },
        className,
      )}
    />
  );
}
