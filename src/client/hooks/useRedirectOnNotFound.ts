import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export function useRedirectOnNotFound(obj: unknown | null) {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (obj != null && timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      void navigate({ to: "/" });
    }, 300);

    return () => {
      if (timeoutRef.current == null) return;
      clearTimeout(timeoutRef.current);
    };
  }, [obj, navigate]);
}
