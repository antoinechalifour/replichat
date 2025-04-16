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
      className={clsx("px-5 py-2.5 prose", {
        "max-w-lg self-end bg-gray-100 rounded-3xl": role === "USER",
      })}
    >
      {children}
    </article>
  );
}
