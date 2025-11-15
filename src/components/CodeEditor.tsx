import { Textarea } from "@headlessui/react";
import clsx from "clsx";
import { useRef } from "react";
import { useResizeObserver, useSessionStorage } from "usehooks-ts";
import { useDialog } from "../hooks/useDialog";
import ConfirmDialog from "./dialogs/ConfirmDialog";

export type CodeEditorProps = {
  disabled?: boolean;
  uneditable?: boolean;
  lines?: "auto" | number | undefined;
  preventPaste?: boolean;
  className?: string;
  value: string;
  format?: CodeFormatter;
  onChange?: (value: string) => void;
};

export type CodeFormatter =
  | {
      type: "react";
      format: (src: string) => React.ReactNode;
    }
  | {
      type: "dangerouslySetInnerHTML";
      format: (src: string) => string;
    };

export default function CodeEditor({
  disabled,
  uneditable,
  lines = uneditable ? "auto" : undefined,
  preventPaste = false,
  format = { type: "react", format: (src) => src },
  className,
  value,
  onChange,
}: CodeEditorProps) {
  const refTextArea = useRef<HTMLTextAreaElement>(null);
  const { height } = useResizeObserver({
    ref: refTextArea as any,
    box: "border-box",
  });

  const refCode = useRef<HTMLElement>(null);

  const [allowPaste, setAllowPaste] = useSessionStorage("allowPaste", false);
  const allowPasteDialog = useDialog();

  return (
    <>
      <ConfirmDialog
        state={allowPasteDialog}
        action="Allow Pasting"
        severity="ERROR"
        title="Allow Pasting?"
        message={
          <>
            Are you sure you want to allow pasting code?
            <br />
            Hackers may ask you to do this to gain access to your account.
            <span className="text-xl font-bold">
              <br />
              <br />
              DO <span className="text-error">NOT</span> PASTE CODE YOU DO NOT
              TRUST!
            </span>
          </>
        }
        onConfirm={() => {
          setAllowPaste(true);
        }}
      />
      <div className="grid w-full max-w-full grid-cols-1 grid-rows-1 gap-0 [grid-template-areas:'editor']">
        <code
          ref={refCode}
          className={clsx(
            "textarea textarea-sm field-sizing-content min-h-10 w-full max-w-full overflow-y-auto font-mono text-sm wrap-break-word whitespace-pre-wrap [grid-area:editor]",
            disabled &&
              "bg-base-200 text-base-content/40 cursor-not-allowed border-none shadow-none",
            className,
          )}
          style={{ height }}
          onScroll={() => {
            if (refCode.current && refTextArea.current) {
              refTextArea.current.scrollTop = refCode.current.scrollTop;
            }
          }}
          dangerouslySetInnerHTML={
            format?.type === "dangerouslySetInnerHTML"
              ? {
                  __html: format.format(value),
                }
              : undefined
          }
          children={format?.type === "react" ? format.format(value) : undefined}
        />
        {
          <Textarea
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            translate="no"
            className={clsx(
              "textarea textarea-sm field-sizing-content min-h-10 w-full max-w-full resize-y overflow-y-auto font-mono text-sm wrap-break-word whitespace-pre-wrap [grid-area:editor]",
              format != null &&
                "caret-base-content border-transparent bg-transparent text-transparent",
              uneditable && "invisible",
              className,
            )}
            style={{
              height: "40px",
              // Stopgap for when field-sizing-content isn't available
              minHeight: lines
                ? `calc(20px + 20px * ${lines === "auto" ? value.split("\n").length || 1 : lines})`
                : undefined,
            }}
            disabled={disabled}
            value={value}
            ref={refTextArea}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onPaste={
              preventPaste && !allowPaste
                ? (e) => {
                    allowPasteDialog.open();
                    e.preventDefault();
                  }
                : undefined
            }
            onChange={(e) => {
              onChange?.(e.target.value);
            }}
            onScroll={() => {
              if (refCode.current && refTextArea.current) {
                refCode.current.scrollTop = refTextArea.current.scrollTop;
              }
            }}
          />
        }
      </div>
    </>
  );
}
