import clsx from "clsx";
import { DateTime } from "luxon";

export type CustomDateInputProps = {
  className?: string;
  value: DateTime | null;
  onChange: (value: DateTime) => void;
};

type Used = keyof CustomDateInputProps;

export default function CustomDateInput({
  className,
  value,
  onChange,
  ...props
}: CustomDateInputProps &
  Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    Used
  >) {
  return (
    <input
      type="date"
      value={value?.toISODate() ?? ""}
      onChange={(e) => {
        const value = e.target.valueAsDate
          ? (DateTime.fromISO(e.target.value) ?? DateTime.local())
          : DateTime.local();
        onChange(value.endOf("day"));
      }}
      {...props}
      className={clsx(
        "bg-base-100 rounded-field border-base-content/20 flex h-(--size) flex-col border p-2 text-sm shadow-sm",
        "disabled:bg-base-200 disabled:text-base-content/40 focus:outline-none disabled:cursor-not-allowed disabled:border-none disabled:shadow-none",
        className,
      )}
    />
  );
}
