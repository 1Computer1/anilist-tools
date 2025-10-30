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

export type CustomListboxProps<TOpt extends string> = {
  modal?: boolean;
  options: TOpt[];
  OptionContents?: React.ComponentType<{ value: TOpt }>;
  ButtonContents?: React.ElementType;
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

export function CustomListbox<TOpt extends string>({
  value,
  onChange,
  multiple = false,
  modal = false,
  options,
  ButtonContents = () => value,
  OptionContents = ({ value }) => value,
  ...props
}: CustomListboxProps<TOpt> & Omit<ListboxButtonProps, Used>) {
  const ref = useRef<HTMLButtonElement>(null);
  const { width } = useResizeObserver({ ref: ref as any, box: "border-box" });

  return (
    <Listbox
      multiple={multiple}
      value={value as any}
      onChange={onChange as any}
    >
      <ListboxButton ref={ref} {...props}>
        <div className="inline-flex w-full flex-row">
          <ButtonContents />
        </div>
      </ListboxButton>
      <ListboxOptions
        transition
        className={clsx(
          "bg-base-100 rounded-field border-base-content/20 flex flex-col border p-2 shadow-sm",
          "origin-top transition duration-150 ease-out data-closed:scale-y-90 data-closed:opacity-0",
          "focus:outline-none",
        )}
        style={width ? { minWidth: width } : { display: "none" }}
        modal={modal}
        anchor="bottom"
      >
        {options.map((o) => (
          <ListboxOption
            key={o}
            value={o}
            className={clsx(
              "rounded-field cursor-default px-2 py-1",
              "hover:bg-base-content/10 data-focus:bg-base-content/10",
            )}
          >
            <OptionContents value={o} />
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
