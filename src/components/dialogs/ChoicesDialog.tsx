import { Button, Description } from "@headlessui/react";
import clsx from "clsx";
import CustomDialog, { type CustomDialogProps } from "./CustomDialog";
import { btnForSeverity, type Severity } from "../../util/severity";

export default function ChoicesDialog({
  choices,
  children,
  ...props
}: {
  choices: {
    text: React.ReactNode;
    severity: Severity;
    onClick: () => unknown;
  }[];
  children: React.ReactNode;
} & Omit<CustomDialogProps, "children">) {
  return (
    <CustomDialog {...props}>
      <Description className="text-wrap whitespace-pre-wrap">
        {children}
      </Description>
      <div className="card-actions mt-4 flex w-full flex-row justify-end gap-2">
        {choices.map(({ text, severity, onClick }, i) => (
          <Button
            key={i}
            className={clsx("btn btn-outline", btnForSeverity(severity))}
            onClick={onClick}
          >
            {text}
          </Button>
        ))}
      </div>
    </CustomDialog>
  );
}
