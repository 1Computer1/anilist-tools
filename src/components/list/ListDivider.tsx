export function ListDivider({ text }: { text: string }) {
  return (
    <div className="divider my-1 w-full text-sm lg:my-2 lg:text-base">
      {text}
    </div>
  );
}
