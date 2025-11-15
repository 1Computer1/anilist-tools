import { useState } from "react";

export type DialogState<T = undefined> = {
  isOpen: boolean;
  setOpen: (x: boolean) => void;
  open: () => void;
  openWith: (ctx: T) => void;
  close: () => void;
  context: T;
  setContext: (value: T) => void;
};

export function useDialog(): DialogState<undefined>;
export function useDialog<T>(init: T): DialogState<T>;
export function useDialog(init?: any): DialogState<any> {
  const [isOpen, setOpen] = useState(false);
  const [context, setContext] = useState(init);
  return {
    isOpen,
    setOpen,
    open: () => setOpen(true),
    openWith: (ctx) => {
      setContext(ctx);
      setOpen(true);
    },
    close: () => setOpen(false),
    context,
    setContext,
  };
}
