import { createContext, useContext } from "react";

export const IsDarkModeContext = createContext<boolean>(false);

export default function useIsDarkMode() {
  return useContext(IsDarkModeContext);
}
