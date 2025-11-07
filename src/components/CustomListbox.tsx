import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  type ListboxButtonProps,
} from "@headlessui/react";
import clsx from "clsx";
import { useRef } from "react";
import { useResizeObserver } from "usehooks-ts";
import useIsOverflown from "../hooks/useIsOverflown";

export type CustomListboxProps<TOpt extends string> = {
  modal?: boolean;
  options: TOpt[];
  optionContents?: (value: TOpt) => React.ReactNode;
  buttonContents?: React.ReactNode;
} & (
  | {
      value: TOpt;
      onChange: (value: TOpt) => void;
      multiple?: false;
    }
  | {
      value: TOpt[];
      onChange: (value: TOpt[]) => void;
      multiple: true;
    }
);

type Used = keyof CustomListboxProps<string>;

export default function CustomListbox<TOpt extends string>({
  value,
  onChange,
  multiple = false,
  modal = false,
  options,
  buttonContents = value,
  optionContents = (value) => value,
  ...props
}: CustomListboxProps<TOpt> & Omit<ListboxButtonProps, Used>) {
  const ref = useRef<HTMLButtonElement>(null);
  const { width } = useResizeObserver({
    ref: ref as any,
    box: "border-box",
  });

  return (
    <Listbox
      multiple={multiple}
      value={value as any}
      onChange={onChange as any}
    >
      <ListboxButton ref={ref} {...props}>
        <div className="inline-flex w-full flex-row">{buttonContents}</div>
      </ListboxButton>
      <ListboxOptions
        transition
        className={clsx(
          "bg-base-100 rounded-field border-base-content/20 flex flex-col border p-2 shadow-sm",
          "origin-top transition duration-150 ease-out data-closed:scale-y-90 data-closed:opacity-0 motion-reduce:transition-none",
          "focus:outline-none",
        )}
        style={width ? { minWidth: width } : { display: "none" }}
        modal={modal}
        anchor="bottom"
      >
        <Options optionContents={optionContents} options={options} />
      </ListboxOptions>
    </Listbox>
  );
}

function Options<TOpt extends string>({
  options,
  optionContents,
}: {
  options: TOpt[];
  optionContents: (value: TOpt) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const needScroll = useIsOverflown(ref);

  return (
    <div
      className="rounded-field flex max-h-60 flex-col overflow-y-auto [scrollbar-width:thin]"
      ref={ref}
    >
      {options.map((o) => (
        <ListboxOption
          key={o}
          value={o}
          className={clsx(
            "rounded-field cursor-default px-2 py-1 text-sm",
            "hover:bg-base-content/10 data-focus:bg-base-content/10",
            needScroll && "mr-2",
          )}
        >
          {optionContents(o)}
        </ListboxOption>
      ))}
    </div>
  );
}
