import { useState } from "react";

export type ReactState<T> = {
  value: T;
  set: React.Dispatch<React.SetStateAction<T>>;
};

export function useStateW<T>(intial: T): ReactState<T> {
  const [value, set] = useState(intial);
  return { value, set };
}
