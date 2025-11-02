import { useState } from "react";

export type Cell<T> = {
  value: T;
  set: React.Dispatch<React.SetStateAction<T>>;
};

export default function useCell<T>(initial: T): Cell<T> {
  const [value, set] = useState(initial);
  return { value, set };
}
