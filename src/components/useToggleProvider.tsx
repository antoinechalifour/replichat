import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { raise } from "~/utils/errors";

function useToggleState() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
type ToggleContext = ReturnType<typeof useToggleState>;

const context = createContext<ToggleContext | null>(null);

export const useToggle = () =>
  useContext(context) ?? raise(new Error("Missing toggle provider"));

export function useToggleProvider() {
  const toggle = useToggleState();
  const Provider = useMemo(
    () => (props: PropsWithChildren) => {
      return (
        <context.Provider value={toggle}>{props.children}</context.Provider>
      );
    },
    [toggle],
  );

  return {
    ...toggle,
    Provider,
  };
}
