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
  let decls = "const entry = __.entry; const match = __.match; ";
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
    return String(f({ entry, match, namedGroups, groups }));
  } catch {
    return "!!ERROR!!";
  }
}
