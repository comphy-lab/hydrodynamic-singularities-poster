/**
 * Build entry: read content + design system, emit a standalone outputs/poster.html.
 *
 * "Standalone" = tokens.css / poster.css / poster-fit.js and every image are
 * inlined (images as base64 data URIs), so the file opens and prints from any
 * browser with no external files. Webfonts still load from Google Fonts.
 *
 *   npx tsx src/build.ts [--orientation portrait|landscape] [--out outputs/poster.html]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import katex from "katex";
import { renderPoster, type RenderOptions } from "./poster.js";
import { poster } from "./content.js";
import type { Orientation } from "./types.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function dataUri(absPath: string): string {
  const mime = MIME[extname(absPath).toLowerCase()] ?? "application/octet-stream";
  return `data:${mime};base64,${readFileSync(absPath).toString("base64")}`;
}

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** KaTeX stylesheet with its woff2 fonts inlined as data URIs, so the rendered
 *  math is fully self-contained (no font fetches at print time). */
function inlineKatexCss(): string {
  const dist = join(ROOT, "node_modules", "katex", "dist");
  let css = readFileSync(join(dist, "katex.min.css"), "utf8");
  css = css.replace(/url\(fonts\/([A-Za-z0-9_-]+)\.woff2\)(\s*format\([^)]*\))?/g, (_m, name) => {
    const b64 = readFileSync(join(dist, "fonts", `${name}.woff2`)).toString("base64");
    return `url(data:font/woff2;base64,${b64}) format("woff2")`;
  });
  // drop the now-unreachable woff/ttf fallbacks so Chrome doesn't 404 on them
  css = css.replace(/,\s*url\(fonts\/[A-Za-z0-9_-]+\.(?:woff|ttf)\)(\s*format\([^)]*\))?/g, "");
  return css;
}

/** Server-side LaTeX → HTML (deterministic; no client JS, no MathJax wait). */
function renderMath(tex: string, display: boolean): string {
  return katex.renderToString(tex, { displayMode: display, throwOnError: false, output: "html" });
}

const orientation = argValue("--orientation") as Orientation | undefined;
const outArg = argValue("--out");

const content = orientation
  ? { ...poster, meta: { ...poster.meta, orientation } }
  : poster;

const cssInline = [
  readFileSync(join(ROOT, "design-system", "tokens.css"), "utf8"),
  readFileSync(join(ROOT, "design-system", "poster.css"), "utf8"),
  inlineKatexCss(),
].join("\n\n");
const jsInline = readFileSync(join(ROOT, "design-system", "poster-fit.js"), "utf8");

const missing: string[] = [];
const opts: RenderOptions = {
  resolveAsset: (src) => {
    const abs = join(ROOT, src);
    if (!existsSync(abs)) {
      missing.push(src);
      return src;
    }
    return dataUri(abs);
  },
  hasAsset: (src) => existsSync(join(ROOT, src)),
  cssInline,
  jsInline,
  renderMath,
};

const html = renderPoster(content, opts);

const outFile = outArg ? resolve(ROOT, outArg) : join(ROOT, "outputs", "poster.html");
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, html, "utf8");

if (missing.length) {
  console.warn(`[build] WARNING — ${missing.length} missing asset(s):`);
  for (const m of missing) console.warn(`         · ${m}`);
}
console.log(
  `[build] wrote ${outFile}  (${(html.length / 1024).toFixed(0)} KB, ${content.meta.orientation} A0)`,
);
