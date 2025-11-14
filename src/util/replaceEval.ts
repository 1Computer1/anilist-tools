import type { Entry } from "../api/queries/list";

export default function replaceEval(
  entry: Entry,
  str: string,
  regexp: RegExp,
  replacer: string,
) {
  return str.replace(regexp, function (...args) {
    const last = args.at(-1);
    const namedGroups = typeof last === "object" ? last : undefined;
    const groups = args.slice(1, namedGroups ? -3 : -2);

    let decls = "const entry = __.entry; ";
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
      return f({ entry, namedGroups, groups });
    } catch {
      return "!!ERROR!!";
    }
  });
}
