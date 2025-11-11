import { useState, useEffect } from "react";
import { useResizeObserver } from "usehooks-ts";

// For this to work, the element whose size is being tracked must be the root element
// of the component, so that it can properly run on render.
export default function useIsOverflown<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
): boolean {
  const [needScroll, setNeedScroll] = useState<boolean>(false);

  const onResize = () => {
    if (ref.current) {
      setNeedScroll(isOverflown(ref.current));
    }
  };

  useEffect(onResize);
  useResizeObserver({
    ref: ref as any,
    box: "border-box",
    onResize,
  });

  return needScroll;
}

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}
