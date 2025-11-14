import { createStarryNight } from "@wooorm/starry-night";
import sourceRegexp from "@wooorm/starry-night/source.regexp";
import sourceRegexpExtended from "@wooorm/starry-night/source.regexp.extended";
import sourceRegexpPosix from "@wooorm/starry-night/source.regexp.posix";
import sourceSy from "@wooorm/starry-night/source.sy";
import sourceJs from "@wooorm/starry-night/source.js";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { toHtml } from "hast-util-to-html";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

export const StarryNight = await createStarryNight([
  sourceRegexp,
  sourceRegexpExtended,
  sourceRegexpPosix,
  sourceSy,
  sourceJs,
]);

export function highlightToJsx(code: string, scope: string) {
  const tree = StarryNight.highlight(code, scope);
  return toJsxRuntime(tree, { Fragment, jsx, jsxs });
}

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
