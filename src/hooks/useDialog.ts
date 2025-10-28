import { useState } from "react";

export type DialogState = {
  isOpen: boolean;
  setOpen: (x: boolean) => void;
  open: () => void;
  close: () => void;
};

export function useDialog(): DialogState {
  const [isOpen, setOpen] = useState(false);
  return {
    isOpen,
    setOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
  };
}
