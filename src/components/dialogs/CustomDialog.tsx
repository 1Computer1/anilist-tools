import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import type { DialogState } from "../../hooks/useDialog";
import { PiXCircleFill } from "react-icons/pi";
import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import { useResizeObserver } from "usehooks-ts";

export type CustomDialogProps = {
  state: DialogState<any>;
  title: string;
  children: React.ReactNode;
  closeButton?: boolean;
};

export default function CustomDialog({
  state,
  title,
  children,
  closeButton = true,
}: CustomDialogProps) {
  return (
    <Dialog
      open={state.isOpen}
      onClose={() => state.close()}
      transition
      className="transition duration-150 ease-out data-closed:opacity-0 motion-reduce:transition-none"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="flex-center fixed inset-0 h-dvh w-dvw">
        <DialogPanel className="bg-base-100 flex-center rounded-box card card-border max-h-[80dvh] min-w-[min(var(--container-md),90dvw)] shadow lg:min-w-md">
          <div className="flex-center max-h-[80dvh] w-full gap-y-2 pb-4">
            <div className="flex w-full flex-row items-center justify-between px-4 pt-4">
              <DialogTitle className="card-title">{title}</DialogTitle>
              {closeButton && (
                <Button
                  className="btn btn-ghost btn-square btn-sm -mt-6 -mr-2.5 size-6 text-base"
                  onClick={() => state.close()}
                >
                  <PiXCircleFill />
                </Button>
              )}
            </div>
            <DialogBody>{children}</DialogBody>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function DialogBody({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [needScroll, setNeedScroll] = useState<boolean>(false);

  const onResize = () => {
    if (ref.current) {
      console.log(
        "body height",
        ref.current.scrollHeight,
        ref.current.clientHeight,
      );
      setNeedScroll(isOverflown(ref.current));
    }
  };

  useEffect(onResize);
  useResizeObserver({
    ref: ref as any,
    box: "border-box",
    onResize,
  });

  return (
    <div
      ref={ref}
      className={clsx(
        "w-full px-4",
        needScroll ? "overflow-y-scroll" : "overflow-y-auto",
      )}
    >
      {children}
    </div>
  );
}

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}
