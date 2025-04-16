import { useMedia } from "react-use";

export const useIsWide = () => useMedia("(min-width: 768px)");
