import { Field, Label } from "@headlessui/react";

export default function SettingsItem({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Field className="flex w-full flex-col gap-y-1 text-sm md:text-base">
      <Label>{label}</Label>
      {children}
    </Field>
  );
}
