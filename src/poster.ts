/**
 * Renderer: PosterContent -> standalone A0 HTML, on the CoMPhy Lab design system.
 *
 * Pure string composition. All file I/O (inlining CSS/JS and images as data
 * URIs) is injected via RenderOptions so this module stays side-effect free.
 *
 * Layout = the design system's hero-band template with two refinements:
 *   - the hero's side column stacks the lede over an optional plots figure;
 *   - blocks with column:"full" render as full-width bands below the two
 *     columns (a synthesis band, then a references|acknowledgements endmatter).
 */

import type { Block, Chip, Figure, Logo, PosterContent } from "./types.js";

export interface RenderOptions {
  /** Map a repo-relative asset path to its final src (typically a data URI). */
  resolveAsset: (src: string) => string;
  /** Whether an optional asset (e.g. the QR png) exists on disk. */
  hasAsset: (src: string) => boolean;
  /** tokens.css + poster.css, concatenated, to inline in a <style>. */
  cssInline: string;
  /** poster-fit.js, to inline before </body>. */
  jsInline: string;
  /** Server-side LaTeX → HTML (KaTeX). display=true for block equations. */
  renderMath: (tex: string, display: boolean) => string;
}

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";

/** Poster-specific styling on top of the design system (references tokens only). */
const POSTER_EXTRAS = `
/* Tighten the A0 rhythm — this poster is content-dense, so trim the outer
   margin, the inter-block gap and the column gutter to keep everything on one
   sheet without overflow. */
:root { --p-pad: 32mm; --p-block: 15mm; --p-gutter: 22mm; }

/* Outcome verdict chip pinned under a section — the only coral/teal call-outs */
.p-outcome {
  display: flex; align-items: center; gap: 12pt;
  font-family: var(--t-sans); font-weight: var(--t-weight-bold);
  font-size: var(--pt-body); line-height: 1.2;
  border-radius: var(--r-sm); padding: 9pt 18pt; margin: 12pt 0 0;
}
.p-outcome::before { content: "→"; font-weight: 800; font-size: 1.1em; }
.p-outcome--coral {
  background: color-mix(in srgb, var(--c-accent-coral) 12%, transparent);
  color: var(--c-accent-coral);
  border: 1.5px solid color-mix(in srgb, var(--c-accent-coral) 32%, transparent);
}
.p-outcome--teal {
  background: color-mix(in srgb, var(--c-accent-teal) 12%, transparent);
  color: var(--c-accent-teal);
  border: 1.5px solid color-mix(in srgb, var(--c-accent-teal) 32%, transparent);
}

/* Scaling-law / stress breadcrumb (KaTeX display math) */
.p-formula {
  font-size: 22pt; line-height: 1.1;
  color: var(--c-accent-teal); margin: 6pt 0 14pt;
}
.p-formula .katex-display { margin: 0; }
.p-formula .katex { color: var(--c-accent-teal); }

.fig__bed { background: var(--c-paper); display: grid; place-items: center; padding: 8mm; }

/* Columns: top-pack with a uniform gap (the .p-col gap drives spacing) */
.p-cols .p-col { justify-content: flex-start; }
.p-col > * { margin-bottom: 0; }

/* Size the body to its content (not a fixed flex height) so a tall column's
   figure / caption / verdict can never be clipped behind the bands below it.
   The poster then fills via its bands + a small uniform bottom margin. */
.p-body { flex: 0 0 auto; }
.p-footer { margin-top: 0; }

/* Partner-mark treatments so each sits cleanly on warm paper */
.p-partner--multiply { mix-blend-mode: multiply; }
:root[data-theme="light"] .p-partner--invert { filter: invert(1); opacity: 0.8; }
:root[data-theme="dark"]  .p-partner--multiply { mix-blend-mode: screen; }

/* Header lab mark — smaller and vertically centred against the headline */
.p-header { align-items: center; }
.p-logos__lab img { height: 52mm; }

/* Hero: lede over the h(t) scaling plots in the side column */
.p-hero { align-items: start; }
.p-hero__side { display: flex; flex-direction: column; gap: var(--p-block); min-height: 0; }
.p-hero__lede { padding-top: 2mm; }
.p-hero__plots { margin: 0; }
.p-hero__plots img { width: 100%; height: auto; display: block; }
.p-hero__plots .fig__cap { padding: 10pt 0 0; border-top: 1px solid var(--c-border); }

/* Card headings (scaling, synthesis) sit a step below section headings */
.block--key .block__h { font-size: 31pt; }

/* Full-width bands (direct children of poster__inner) */
.poster__inner > .block { margin: 0; }
.p-endmatter { display: flex; gap: var(--p-gutter); align-items: stretch; }
.p-endmatter__refs { flex: 2.3; min-width: 0; }
.p-endmatter__ack  { flex: 1; min-width: 0; }
.p-endmatter .block { margin: 0; }

/* References get room: two columns, looser leading */
.block--band .refs { columns: 2; column-gap: var(--p-gutter); }
.block--band .refs li { break-inside: avoid; margin-bottom: 13pt; }

/* Synthesis band: three takeaways across the full width */
.block--key.block--band ul { columns: 3; column-gap: var(--p-gutter); margin: 0; }
.block--key.block--band li { break-inside: avoid; margin-bottom: 0; }

/* Print fix: the base print rule collapses .poster to height:100% of a
   height-less .stage, so it shrinks to content height and the footer falls off.
   Re-assert true A0 so the body fills the sheet and the footer pins to the bottom. */
@media print {
  html, body { margin: 0 !important; height: auto !important; background: var(--c-surface-strong) !important; }
  .stage { position: static !important; height: auto !important; overflow: visible !important; background: none !important; }
  .stage::before { display: none !important; }
  .poster { position: static !important; transform: none !important; box-shadow: none !important; margin: 0 !important; }
  .poster--portrait  { width: 841mm !important;  height: 1189mm !important; }
  .poster--landscape { width: 1189mm !important; height: 841mm  !important; }
}
`;

function escAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Replace $…$ (inline) and $$…$$ (display) with server-rendered KaTeX. */
function mathify(s: string, opts: RenderOptions): string {
  return s
    .replace(/\$\$([\s\S]+?)\$\$/g, (_m, tex) => opts.renderMath(tex, true))
    .replace(/\$([^$\n]+?)\$/g, (_m, tex) => opts.renderMath(tex, false));
}

function chip(c: Chip): string {
  const teal = c.tone === "teal" ? " p-chip--teal" : "";
  return `<span class="p-chip${teal}">${c.text}</span>`;
}

function img(src: string, alt: string, opts: RenderOptions, style = ""): string {
  const s = style ? ` style="${style}"` : "";
  return `<img src="${opts.resolveAsset(src)}" alt="${escAttr(alt)}"${s} />`;
}

function figure(fig: Figure, opts: RenderOptions): string {
  const blend = fig.blend === false ? "" : "mix-blend-mode:multiply;";
  const cap = fig.caption
    ? `<figcaption class="fig__cap">${mathify(fig.caption, opts)}</figcaption>`
    : "";
  return `<figure class="fig">
  <div class="fig__bed">${img(fig.src, fig.alt, opts, `width:auto;max-width:100%;max-height:122mm;${blend}`)}</div>
  ${cap}
</figure>`;
}

function heading(text: string, opts: RenderOptions): string {
  return `<h2 class="block__h">${mathify(text, opts)}</h2>`;
}

function renderBlock(block: Block, opts: RenderOptions): string {
  const band = block.column === "full" ? " block--band" : "";
  switch (block.kind) {
    case "section": {
      const chips = block.chips?.length
        ? `<div class="p-chips">${block.chips.map(chip).join("")}</div>`
        : "";
      const body = (block.body ?? []).map((p) => `<p>${mathify(p, opts)}</p>`).join("");
      const items = block.items?.length
        ? `<ul>${block.items.map((li) => `<li>${mathify(li, opts)}</li>`).join("")}</ul>`
        : "";
      const fig = block.figure ? figure(block.figure, opts) : "";
      const outcome = block.outcome
        ? `<p class="p-outcome p-outcome--${block.outcome.tone}">${block.outcome.text}</p>`
        : "";
      const grow = block.grow ? " block--grow" : "";
      return `<section class="block${grow}${band}">
  ${heading(block.heading, opts)}
  ${chips}
  ${body}
  ${items}
  ${fig}
  ${outcome}
</section>`;
    }
    case "key": {
      const body = (block.body ?? []).map((p) => `<p>${mathify(p, opts)}</p>`).join("");
      const items = block.items?.length
        ? `<ul>${block.items.map((li) => `<li>${mathify(li, opts)}</li>`).join("")}</ul>`
        : "";
      return `<section class="block block--key${band}">
  ${heading(block.heading, opts)}
  ${body}
  ${items}
</section>`;
    }
    case "scaling": {
      return `<section class="block block--key${band}">
  ${heading(block.heading, opts)}
  <div class="p-formula">${opts.renderMath(block.formula, true)}</div>
  <p>${mathify(block.note, opts)}</p>
</section>`;
    }
    case "references": {
      const items = block.items.map((r) => `<li>${mathify(r, opts)}</li>`).join("");
      return `<section class="block${band}">
  ${heading(block.heading, opts)}
  <ol class="refs">${items}</ol>
</section>`;
    }
    case "acknowledgements": {
      return `<section class="block${band}">
  ${heading(block.heading, opts)}
  <p class="ack">${mathify(block.body, opts)}</p>
</section>`;
    }
  }
}

function renderHeader(content: PosterContent, opts: RenderOptions): string {
  const { meta, labMark } = content;
  const authors = meta.authors
    .map((a) => `${a.name}${a.marks?.length ? `<sup>${a.marks.join(",")}</sup>` : ""}`)
    .join(", ");
  const affil = meta.affiliations
    .map((af) => `<sup>${af.mark}</sup>${af.text}`)
    .join(" &nbsp;·&nbsp; ");
  const subtitle = meta.subtitle ? `<p class="p-subtitle">${meta.subtitle}</p>` : "";
  return `<header class="p-header">
  <div class="p-headline">
    <p class="p-eyebrow">${meta.eyebrow}</p>
    <h1 class="p-title">${meta.title}</h1>
    ${subtitle}
    <p class="p-authors">${authors}</p>
    <p class="p-affil">${affil}</p>
  </div>
  <div class="p-logos">
    <div class="p-logos__lab">${logoImg(labMark, opts)}</div>
  </div>
</header>`;
}

function logoImg(logo: Logo, opts: RenderOptions): string {
  const cls = logo.treatment && logo.treatment !== "normal"
    ? ` class="p-partner p-partner--${logo.treatment}"`
    : "";
  const style = logo.height ? ` style="height:${logo.height}"` : "";
  return `<img src="${opts.resolveAsset(logo.src)}" alt="${escAttr(logo.alt)}"${cls}${style} />`;
}

function renderHero(content: PosterContent, opts: RenderOptions): string {
  const { hero } = content;
  const fblend = hero.figure.blend === false ? "" : "mix-blend-mode:multiply;";
  const fcap = hero.figure.caption
    ? `<figcaption class="fig__cap">${mathify(hero.figure.caption, opts)}</figcaption>`
    : "";
  const plots = hero.plots
    ? `<figure class="p-hero__plots">
      ${img(hero.plots.src, hero.plots.alt, opts, hero.plots.blend === false ? "" : "mix-blend-mode:multiply;")}
      ${hero.plots.caption ? `<figcaption class="fig__cap">${mathify(hero.plots.caption, opts)}</figcaption>` : ""}
    </figure>`
    : "";
  return `<section class="p-hero">
  <figure class="fig" style="margin:0;">
    <div class="fig__bed" style="padding:10mm;">
      ${img(hero.figure.src, hero.figure.alt, opts, `width:auto;max-width:100%;max-height:168mm;${fblend}`)}
    </div>
    ${fcap}
  </figure>
  <div class="p-hero__side">
    <p class="p-hero__lede">${mathify(hero.lede, opts)}</p>
    ${plots}
  </div>
</section>`;
}

function renderFooter(content: PosterContent, opts: RenderOptions): string {
  const { footer } = content;
  const hasImg = !!footer.qr.img && opts.hasAsset(footer.qr.img);
  const code = hasImg
    ? img(footer.qr.img!, `QR code linking to ${footer.qr.url}`, opts)
    : "<i></i>";
  const lines = footer.qr.lines
    .map((l, i) =>
      i === footer.qr.lines.length - 1 ? `<span class="mono">${l}</span>` : l,
    )
    .join("<br />");
  const partners = footer.partners.map((p) => logoImg(p, opts)).join("\n      ");
  return `<footer class="p-footer">
  <div class="qr${hasImg ? " has-img" : ""}">
    <div class="qr__code">${code}</div>
    <div class="qr__label"><b>${footer.qr.title}</b>${lines}</div>
  </div>
  <div class="p-contact">${footer.contact.join("<br />")}</div>
  <div class="p-funding">
      ${partners}
  </div>
</footer>`;
}

export function renderPoster(content: PosterContent, opts: RenderOptions): string {
  const { meta } = content;
  const inCol = (c: "left" | "right") =>
    content.blocks.filter((b) => b.column === c).map((b) => renderBlock(b, opts)).join("\n");
  const left = inCol("left");
  const right = inCol("right");

  const full = content.blocks.filter((b) => b.column === "full");
  const refsBlock = full.find((b) => b.kind === "references");
  const ackBlock = full.find((b) => b.kind === "acknowledgements");
  const emphasis = full.filter((b) => b.kind !== "references" && b.kind !== "acknowledgements");
  const emphasisHtml = emphasis.map((b) => renderBlock(b, opts)).join("\n");
  const endmatterHtml = refsBlock || ackBlock
    ? `<div class="p-endmatter">
${refsBlock ? `<div class="p-endmatter__refs">${renderBlock(refsBlock, opts)}</div>` : ""}
${ackBlock ? `<div class="p-endmatter__ack">${renderBlock(ackBlock, opts)}</div>` : ""}
</div>`
    : "";

  const pageSize = meta.orientation === "landscape" ? "1189mm 841mm" : "841mm 1189mm";

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escAttr(meta.title)} — CoMPhy Lab</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${FONTS_HREF}" rel="stylesheet" />
<style>
${opts.cssInline}
</style>
<style>
@page { size: ${pageSize}; margin: 0; }
${POSTER_EXTRAS}
</style>
</head>
<body>
<div class="stage">
  <article class="poster poster--${meta.orientation} poster--hero">
    <div class="poster__inner">
${renderHeader(content, opts)}
${renderHero(content, opts)}
      <div class="p-body p-cols">
        <div class="p-col">
${left}
        </div>
        <div class="p-col">
${right}
        </div>
      </div>
${emphasisHtml}
${endmatterHtml}
${renderFooter(content, opts)}
    </div>
  </article>
</div>
<div class="toolbar">
  <button onclick="window.print()">Print / Save PDF · A0</button>
</div>
<script>
${opts.jsInline}
</script>
</body>
</html>
`;
}
