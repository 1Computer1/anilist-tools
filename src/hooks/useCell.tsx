import * as _ from "lodash-es";
import { useState } from "react";

export type Cell<T> = {
  value: T;
  set: React.Dispatch<React.SetStateAction<T>>;
};

export default function useCell<T>(initial: T): Cell<T> {
  const [value, set] = useState(initial);
  return { value, set };
}

export type CellValues<T extends Record<any, Cell<any>>> = {
  [K in keyof T]: T[K] extends Cell<infer V> ? V : never;
};

export function cellValues<T extends Record<any, Cell<any>>>(
  obj: T,
): CellValues<T> {
  return _.mapValues(obj, (x) => x.value);
}
