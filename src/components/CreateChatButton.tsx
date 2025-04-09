import { useNavigate } from "@tanstack/react-router";
import { IconButton } from "~/components/IconButton";
import { PenSquareIcon } from "lucide-react";
import { startTransition, useEffect } from "react";
import { Hint } from "~/components/Hint";

export function CreateChatButton() {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "m" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        navigate({ to: "/" });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Hint text="New (⌘M)">
      <IconButton
        title="Create chat"
        onClick={() => navigate({ to: "/" })}
        icon={PenSquareIcon}
      />
    </Hint>
  );
}
