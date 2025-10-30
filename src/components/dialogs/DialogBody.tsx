import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import { useResizeObserver } from "usehooks-ts";

export function DialogBody({ children }: { children: React.ReactNode }) {
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
