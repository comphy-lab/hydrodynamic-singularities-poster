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

import type { Block, Chip, Figure, Logo, PosterContent, QR } from "./types.js";

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
:root { --p-pad: 30mm; --p-block: 10mm; --p-gutter: 22mm; }

/* Header — tighten the lockup so the title block doesn't eat the sheet */
.p-header { padding-bottom: 11mm; }
.p-title { font-size: 92pt; }
.p-eyebrow { margin-bottom: 8pt; }
.p-subtitle { max-width: 62ch; font-size: 24pt; margin-top: 11pt; }
.p-authors { margin-top: 9pt; }
.p-affil { margin-top: 5pt; }
.p-collab { font-family: var(--t-sans); font-size: var(--pt-small); color: var(--fg-2); margin: 6pt 0 0; line-height: 1.4; max-width: 78ch; }
.p-collab b { color: var(--fg-strong); font-weight: var(--t-weight-semi); }

/* Full-width key cards (the pivot + the compare grid) sit slimmer than the
   default conclusion card so the dense poster still fits one A0 sheet. */
.block--key.block--band { padding: 11mm 18mm; }

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
/* Footer now carries just contact + partner marks (QR moved to the masthead) */
.p-footer { margin-top: auto; grid-template-columns: 1fr auto; }

/* Partner-mark treatments so each sits cleanly on warm paper */
.p-partner--multiply { mix-blend-mode: multiply; }
:root[data-theme="light"] .p-partner--invert { filter: invert(1); opacity: 0.8; }
:root[data-theme="dark"]  .p-partner--multiply { mix-blend-mode: screen; }

/* Header lab mark — the drop-splash anchors the right of the masthead and
   balances the dense title block (it's on-theme: a splashing drop). The QR
   block sits to its left, filling what used to be masthead whitespace. */
.p-header { align-items: center; }
.p-logos { flex-direction: row; align-items: center; gap: var(--p-gutter); }
.p-logos__lab img { height: 104mm; }
.p-header .qr { gap: 14pt; }
.p-header .qr__code { width: 46mm; height: 46mm; }

/* Hero: the phenomenon first — two stacked pinch-off filmstrips (drop, then
   bubble), each with a left rail (what it is + its self-similar scaling). */
.p-hero--strips { display: block; }
.p-hero__lede {
  font-size: 25pt; line-height: 1.34; max-width: 78ch;
  margin: 0 0 var(--p-block);
}
.p-strips { display: flex; flex-direction: column; gap: 11mm; }
.p-strip {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--p-gutter);
  align-items: center;
  background: var(--c-paper);
  border: 1.5px solid var(--c-border);
  border-radius: var(--r-md);
  padding: 11mm 13mm;
}
.p-strip__rail { min-width: 0; }
.p-strip__label {
  font-family: var(--t-serif); font-weight: var(--t-weight-semi);
  font-size: 35pt; line-height: 1.08; color: var(--fg-strong);
  letter-spacing: -0.012em;
}
.p-strip__label strong { color: var(--c-accent-coral); font-weight: var(--t-weight-bold); }
.p-strip__law { font-size: 25pt; color: var(--c-accent-teal); margin: 10pt 0 0; }
.p-strip__law .katex { color: var(--c-accent-teal); }
.p-strip__note { font-family: var(--t-sans); font-size: var(--pt-small); color: var(--fg-2); margin: 9pt 0 0; line-height: 1.3; }
.p-strip__bed { display: grid; place-items: center; min-width: 0; }
.p-strip__bed img { height: 78mm; width: auto; max-width: 100%; display: block; mix-blend-mode: multiply; }
.p-hero__cap {
  font-family: var(--t-sans); font-size: var(--pt-caption); color: var(--fg-2);
  line-height: 1.38; margin: 10mm 0 0; padding-top: 11pt;
  border-top: 1.5px solid var(--c-border-strong);
}
.p-hero__cap b { color: var(--c-accent-teal); font-weight: var(--t-weight-semi); }

/* Drop-vs-bubble comparison grid (the "why the split" payoff) */
.p-compare { display: grid; gap: 0; }
.p-compare__row {
  display: grid; grid-template-columns: 0.78fr 1.18fr 1.18fr; gap: var(--p-gutter);
  padding: 8pt 0; border-top: 1px solid var(--c-border); align-items: baseline;
}
.p-compare__row:first-child { border-top: 0; }
.p-compare__row--head { border-bottom: 2.5px solid var(--c-border-strong); padding-bottom: 7pt; }
.p-compare__rl {
  font-family: var(--t-sans); font-weight: var(--t-weight-bold);
  font-size: var(--pt-small); color: var(--fg-2);
  text-transform: uppercase; letter-spacing: 0.06em;
}
.p-compare__c { font-family: var(--t-sans); font-size: 23pt; color: var(--fg-1); line-height: 1.28; }
.p-compare__c strong { color: var(--fg-strong); font-weight: var(--t-weight-semi); }
.p-compare__row--head .p-compare__c {
  font-family: var(--t-serif); font-size: 27pt; font-weight: var(--t-weight-bold); line-height: 1;
}
.p-compare__c--a { color: var(--c-accent-coral); }
.p-compare__c--b { color: var(--c-accent-teal); }
.p-compare__note { margin: 11pt 0 0; font-size: var(--pt-body); line-height: 1.34; }
/* Compare band with the polymer schematic to the left of the grid */
.p-compare-wrap { display: grid; grid-template-columns: auto 1fr; gap: var(--p-gutter); align-items: center; }
.p-compare-main { min-width: 0; }
.p-compare__fig { margin: 0; display: grid; place-items: center; }
.p-compare__fig img { height: 82mm; width: auto; max-width: 100%; display: block; }
.p-compare__fig .fig__cap { font-family: var(--t-sans); font-size: var(--pt-small); color: var(--fg-2); line-height: 1.32; padding: 9pt 0 0; border: 0; max-width: 150mm; }
.p-compare__fig .fig__cap b { color: var(--c-accent-teal); font-weight: var(--t-weight-semi); }

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
  <div class="fig__bed">${img(fig.src, fig.alt, opts, `width:auto;max-width:100%;max-height:80mm;${blend}`)}</div>
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
    case "compare": {
      const head = `<div class="p-compare__row p-compare__row--head">
    <div class="p-compare__rl"></div>
    <div class="p-compare__c p-compare__c--a">${mathify(block.columns[0], opts)}</div>
    <div class="p-compare__c p-compare__c--b">${mathify(block.columns[1], opts)}</div>
  </div>`;
      const rows = block.rows
        .map(
          (r) => `<div class="p-compare__row">
    <div class="p-compare__rl">${mathify(r.label, opts)}</div>
    <div class="p-compare__c">${mathify(r.a, opts)}</div>
    <div class="p-compare__c">${mathify(r.b, opts)}</div>
  </div>`,
        )
        .join("\n");
      const note = block.note ? `<p class="p-compare__note">${mathify(block.note, opts)}</p>` : "";
      const grid = `<div class="p-compare">
  ${head}
${rows}
  </div>
  ${note}`;
      if (block.figure) {
        const fcap = block.figure.caption
          ? `<figcaption class="fig__cap">${mathify(block.figure.caption, opts)}</figcaption>`
          : "";
        const fblend = block.figure.blend === false ? "" : "mix-blend-mode:multiply;";
        return `<section class="block block--key${band}">
  ${heading(block.heading, opts)}
  <div class="p-compare-wrap">
    <figure class="p-compare__fig">
      ${img(block.figure.src, block.figure.alt, opts, fblend)}
      ${fcap}
    </figure>
    <div class="p-compare-main">${grid}</div>
  </div>
</section>`;
      }
      return `<section class="block block--key${band}">
  ${heading(block.heading, opts)}
  ${grid}
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

function qrBlock(qr: QR, opts: RenderOptions): string {
  const hasImg = !!qr.img && opts.hasAsset(qr.img);
  const code = hasImg ? img(qr.img!, `QR code linking to ${qr.url}`, opts) : "<i></i>";
  const lines = qr.lines
    .map((l, i) => (i === qr.lines.length - 1 ? `<span class="mono">${l}</span>` : l))
    .join("<br />");
  return `<div class="qr${hasImg ? " has-img" : ""}">
    <div class="qr__code">${code}</div>
    <div class="qr__label"><b>${qr.title}</b>${lines}</div>
  </div>`;
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
  const collab = meta.collaborators ? `<p class="p-collab">${meta.collaborators}</p>` : "";
  return `<header class="p-header">
  <div class="p-headline">
    <p class="p-eyebrow">${meta.eyebrow}</p>
    <h1 class="p-title">${meta.title}</h1>
    ${subtitle}
    <p class="p-authors">${authors}</p>
    <p class="p-affil">${affil}</p>
    ${collab}
  </div>
  <div class="p-logos">
    ${qrBlock(content.footer.qr, opts)}
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

function heroStrip(strip: PosterContent["hero"]["strips"][number], opts: RenderOptions): string {
  const law = strip.scaling
    ? `<div class="p-strip__law">${opts.renderMath(strip.scaling, false)}</div>`
    : "";
  const note = strip.note ? `<div class="p-strip__note">${mathify(strip.note, opts)}</div>` : "";
  const blend = strip.figure.blend === false ? "" : "mix-blend-mode:multiply;";
  return `<figure class="p-strip">
    <div class="p-strip__rail">
      <div class="p-strip__label">${mathify(strip.label, opts)}</div>
      ${law}
      ${note}
    </div>
    <div class="p-strip__bed">${img(strip.figure.src, strip.figure.alt, opts, blend)}</div>
  </figure>`;
}

function renderHero(content: PosterContent, opts: RenderOptions): string {
  const { hero } = content;
  const strips = hero.strips.map((s) => heroStrip(s, opts)).join("\n");
  const cap = hero.caption ? `<p class="p-hero__cap">${mathify(hero.caption, opts)}</p>` : "";
  return `<section class="p-hero p-hero--strips">
  <p class="p-hero__lede">${mathify(hero.lede, opts)}</p>
  <div class="p-strips">
${strips}
  </div>
  ${cap}
</section>`;
}

function renderFooter(content: PosterContent, opts: RenderOptions): string {
  const { footer } = content;
  const partners = footer.partners.map((p) => logoImg(p, opts)).join("\n      ");
  return `<footer class="p-footer">
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
  const hasPlace = (b: Block): b is Block & { place?: "lead" | "tail" } => "place" in b;
  const leadBlocks = emphasis.filter((b) => hasPlace(b) && b.place === "lead");
  const tailBlocks = emphasis.filter((b) => !(hasPlace(b) && b.place === "lead"));
  const leadHtml = leadBlocks.map((b) => renderBlock(b, opts)).join("\n");
  const emphasisHtml = tailBlocks.map((b) => renderBlock(b, opts)).join("\n");
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
${leadHtml}
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
