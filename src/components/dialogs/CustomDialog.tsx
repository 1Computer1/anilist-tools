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
import { useRef } from "react";
import useIsOverflown from "../../hooks/useIsOverflown";

export type CustomDialogProps = {
  state: DialogState<any>;
  title?: React.ReactNode;
  children: React.ReactNode;
  closeable?: boolean;
};

export default function CustomDialog({
  state,
  title,
  children,
  closeable = true,
}: CustomDialogProps) {
  return (
    <Dialog
      open={state.isOpen}
      onClose={() => {
        if (closeable) {
          state.close();
        }
      }}
      transition
      className="transition duration-150 ease-out focus:outline-none data-closed:opacity-0 motion-reduce:transition-none"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="flex-center fixed inset-0 h-dvh w-dvw">
        <DialogPanel className="bg-base-100 flex-center rounded-box card card-border m-4 max-h-[80dvh] min-w-[min(var(--container-md),90dvw)] shadow lg:min-w-md">
          <div
            className={clsx(
              "flex-center max-h-[80dvh] w-full gap-y-2 pb-4",
              !title && !closeable && "pt-4",
            )}
          >
            {(title || closeable) && (
              <div className="flex w-full flex-row items-center justify-between px-4 pt-4">
                {title && (
                  <DialogTitle className="card-title">{title}</DialogTitle>
                )}
                {closeable && (
                  <Button
                    className="btn btn-ghost btn-square btn-sm -mt-6 -mr-2.5 size-6 text-base"
                    onClick={() => state.close()}
                  >
                    <PiXCircleFill />
                  </Button>
                )}
              </div>
            )}
            <DialogBody>{children}</DialogBody>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function DialogBody({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const needScroll = useIsOverflown(ref);

  return (
    <div
      ref={ref}
      className={clsx(
        "w-full px-4 pb-1",
        needScroll ? "overflow-y-scroll" : "overflow-y-auto",
      )}
    >
      {children}
    </div>
  );
}
