import type React from "react";
import { InlineCode } from "./InlineCode";

export function CodeTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: [string, React.ReactNode][];
}) {
  return (
    <div className="rounded-box border-base-content/10 border">
      <table className="table">
        <thead>
          {headers.map((x) => (
            <td key={x}>{x}</td>
          ))}
        </thead>
        <tbody>
          {rows.map(([l, r]) => (
            <tr key={l}>
              <th>
                <InlineCode>{l}</InlineCode>
              </th>
              <th className="font-normal">{r}</th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
