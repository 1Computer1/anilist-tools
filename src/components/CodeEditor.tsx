import { Textarea } from "@headlessui/react";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useResizeObserver } from "usehooks-ts";

export default function CodeEditor({
  disabled,
  uneditable,
  format,
  placeholder,
  className,
  value,
  onChange,
}: {
  disabled?: boolean;
  uneditable?: boolean;
  format?:
    | ((src: string) => React.ReactNode)
    | { dangerouslySetInnerHTML: (src: string) => string };
  placeholder?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
}) {
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
          {...(value === ""
            ? {
                children: (
                  <span className="text-current/50">{placeholder}</span>
                ),
              }
            : "dangerouslySetInnerHTML" in format
              ? {
                  dangerouslySetInnerHTML: {
                    __html: format.dangerouslySetInnerHTML(value),
                  },
                }
              : { children: format(value) })}
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
          placeholder={placeholder}
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
