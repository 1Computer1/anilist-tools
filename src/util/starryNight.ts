import { createStarryNight } from "@wooorm/starry-night";
import sourceRegexp from "@wooorm/starry-night/source.regexp";
import sourceRegexpExtended from "@wooorm/starry-night/source.regexp.extended";
import sourceRegexpPosix from "@wooorm/starry-night/source.regexp.posix";
import sourceSy from "@wooorm/starry-night/source.sy";
import sourceJs from "@wooorm/starry-night/source.js";
import { toHtml } from "hast-util-to-html";
import type { CodeFormatter } from "../components/CodeEditor";

export const StarryNight = await createStarryNight([
  sourceRegexp,
  sourceRegexpExtended,
  sourceRegexpPosix,
  sourceSy,
  sourceJs,
]);

export function highlightToHtml(code: string, scope: string) {
  try {
    const tree = StarryNight.highlight(code, scope);
    return toHtml(tree);
  } catch {
    return escapeHtml(code);
  }
}

export function escapeHtml(unsafe: string) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function codeFormatter(scope: string): CodeFormatter {
  return {
    type: "dangerouslySetInnerHTML",
    format: (src) => highlightToHtml(src, scope),
  };
}
