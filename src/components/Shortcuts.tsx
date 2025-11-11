import { Fragment } from "react";

export function Shortcuts({
  shortcuts,
}: {
  shortcuts: ({ keys: string; desc: string } | { divider: string })[];
}) {
  return (
    <ul className="flex w-full flex-col items-start justify-center gap-x-8 gap-y-2">
      {shortcuts.map((o, i) =>
        "divider" in o ? (
          <li
            key={i}
            className="flex w-full flex-row items-center justify-between gap-2"
          >
            {o.divider}
          </li>
        ) : (
          <li
            className="flex w-full flex-row items-center justify-between gap-2"
            key={o.keys}
          >
            <span className="inline-flex max-w-1/2 flex-row items-center justify-start gap-y-1">
              {o.keys.split("...").map((x1, i1) => (
                <Fragment key={i1}>
                  {i1 > 0 && "\u2009…\u2009"}
                  {x1.split("|").map((x2, i2) => (
                    <Fragment key={i2}>
                      {i2 > 0 && "\u2009"}
                      <kbd className="kbd text-xs lg:text-sm">
                        {x2.trim().replaceAll(/\\(.)/g, "$1")}
                      </kbd>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </span>
            <div className="border-neutral grow border-b border-dotted px-1"></div>
            <span className="text-xs text-nowrap sm:text-sm md:text-base">
              {o.desc}
            </span>
          </li>
        ),
      )}
    </ul>
  );
}
