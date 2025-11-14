import { Field, Label } from "@headlessui/react";

export default function SettingsItem({
  label,
  side,
  between,
  children,
}: {
  label: React.ReactNode;
  side?: React.ReactNode;
  between?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Field className="flex w-full flex-col gap-y-1.5 text-sm md:text-base">
      <div className="flex flex-row items-center gap-x-1">
        <Label>{label}</Label>
        {side}
      </div>
      {between}
      {children}
    </Field>
  );
}
