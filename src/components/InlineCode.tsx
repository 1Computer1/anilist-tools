import type React from "react";

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-base-200 border-base-200 rounded-field p-1">
      {children}
    </code>
  );
}
