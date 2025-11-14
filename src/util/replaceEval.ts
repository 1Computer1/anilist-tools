import type { Entry } from "../api/queries/list";

export default function replaceEval(
  entry: Entry,
  str: string,
  regexp: RegExp,
  replacer: string,
) {
  return str.replace(regexp, (...args) => {
    const last = args.at(-1);
    const match = args[0];
    const namedGroups = typeof last === "object" ? last : null;
    const groups = args.slice(1, namedGroups ? -3 : -2);
    return substituteEval(entry, match, groups, namedGroups, replacer);
  });
}

export function substituteEval(
  entry: Entry,
  match: string,
  groups: string[],
  namedGroups: Record<string, string> | null,
  replacer: string,
) {
  let decls = "const { entry, match, parse, format } = __;";
  if (namedGroups) {
    for (const [k, _] of Object.entries(namedGroups)) {
      decls += `const $${k} = __.namedGroups["${k}"]; `;
    }
  }
  for (let i = 0; i < groups.length; i++) {
    decls += `const $${i + 1} = __.groups[${i}]; `;
  }

  try {
    const f = new Function("__", `${decls} return ${replacer};`);
    return String(
      f({
        entry,
        match,
        namedGroups,
        groups,
        parse,
        format,
      }),
    );
  } catch {
    return "!!ERROR!!";
  }
}

function parse(str: string, sep: string): [Record<string, string>, string] {
  const rows = [];
  const lines = [];
  for (const line of str.split("\n")) {
    const p = line.split(sep, 2);
    if (p.length > 1) {
      rows.push([p[0].trim(), p[1].trim()]);
    } else {
      lines.push(line);
    }
  }
  return [Object.fromEntries(rows), lines.join("\n")];
}

function format({
  before,
  after,
  sep = " = ",
  table,
}: {
  before?: string;
  after?: string;
  sep?: string;
  table?: Record<string, any>;
}) {
  let str = "";
  if (before) {
    str += before + "\n";
  }
  if (table) {
    str +=
      Object.entries(table)
        .map(([k, v]) => k + sep + v)
        .join("\n") + "\n";
  }
  if (after) {
    str += after + "\n";
  }
  return str.trim();
}
