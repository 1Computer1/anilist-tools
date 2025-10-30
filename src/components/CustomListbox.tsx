import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  type ListboxButtonProps,
} from "@headlessui/react";
import clsx from "clsx";

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
  return (
    <Listbox
      multiple={multiple}
      value={value as any}
      onChange={onChange as any}
    >
      <ListboxButton {...props}>
        <div className="inline-flex w-full flex-row">
          <ButtonContents />
        </div>
      </ListboxButton>
      <ListboxOptions
        className={clsx(
          "bg-base-100 rounded-field border-base-content/20 flex min-w-(--button-width) flex-col border p-2 shadow-sm",
          "focus:outline-none",
        )}
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
