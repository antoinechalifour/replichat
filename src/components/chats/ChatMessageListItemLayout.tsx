import { PropsWithChildren } from "react";
import clsx from "clsx";

export function ChatMessageListItemLayout({
  children,
  id,
  role,
}: PropsWithChildren<{ id?: string; role: "SYSTEM" | "USER" }>) {
  return (
    <article
      id={id}
      className={clsx("py-2.5 prose max-sm:max-w-none", {
        "px-5 max-w-lg self-end bg-gray-100 rounded-3xl": role === "USER",
        "px-1 sm:px-5 ": role === "SYSTEM",
      })}
    >
      {children}
    </article>
  );
}
