import { Textarea } from "@headlessui/react";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useResizeObserver } from "usehooks-ts";

export type CodeEditorProps = {
  disabled?: boolean;
  uneditable?: boolean;
  className?: string;
  value: string;
  format?: CodeFormatter;
  onChange: (value: string) => void;
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
  format,
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

  useEffect(() => {
    if (refTextArea.current) {
      const elem = refTextArea.current;
      if (elem.scrollHeight > 40) {
        elem.style.height = "40px";
        elem.style.height = elem.scrollHeight + 2 + "px";
      }
    }
  }, [refTextArea.current]);

  return (
    <div className="grid w-full max-w-full grid-cols-1 grid-rows-1 gap-0 [grid-template-areas:'editor']">
      {format && (
        <code
          ref={refCode}
          className={clsx(
            "textarea textarea-sm h-10 min-h-10 w-full max-w-full overflow-y-auto font-mono text-sm wrap-break-word whitespace-pre-wrap [grid-area:editor]",
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
      )}
      {
        <Textarea
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          translate="no"
          className={clsx(
            "textarea textarea-sm h-10 min-h-10 w-full max-w-full resize-y overflow-y-auto font-mono text-sm wrap-break-word whitespace-pre-wrap [grid-area:editor]",
            format != null &&
              "caret-base-content border-transparent bg-transparent text-transparent",
            uneditable && "invisible",
            className,
          )}
          disabled={disabled}
          value={value}
          ref={refTextArea}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.scrollHeight > 40) {
              e.target.style.height = "40px";
              e.target.style.height = e.target.scrollHeight + 2 + "px";
            }
          }}
          onScroll={() => {
            if (refCode.current && refTextArea.current) {
              refCode.current.scrollTop = refTextArea.current.scrollTop;
            }
          }}
        />
      }
    </div>
  );
}
