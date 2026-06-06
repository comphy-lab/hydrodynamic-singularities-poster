/**
 * Renderer: PosterContent -> standalone A0 HTML, on the CoMPhy Lab design system.
 *
 * Pure string composition. All file I/O (inlining CSS/JS and images as data
 * URIs) is injected via RenderOptions so this module stays side-effect free and
 * testable. Layout = the design system's hero-band template
 * (`.poster--hero`): full-width header + graphical-abstract hero, then two
 * explicit columns whose blocks are placed by their `column` field.
 */

import type {
  Block,
  Chip,
  Figure,
  Logo,
  PosterContent,
} from "./types.js";

export interface RenderOptions {
  /** Map a repo-relative asset path to its final src (typically a data URI). */
  resolveAsset: (src: string) => string;
  /** Whether an optional asset (e.g. the QR png) exists on disk. */
  hasAsset: (src: string) => boolean;
  /** tokens.css + poster.css, concatenated, to inline in a <style>. */
  cssInline: string;
  /** poster-fit.js, to inline before </body>. */
  jsInline: string;
}

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";

/** Poster-specific styling on top of the design system (references tokens only). */
const POSTER_EXTRAS = `
/* Outcome verdict chip pinned under a section */
.p-outcome {
  display: flex; align-items: center; gap: 12pt;
  font-family: var(--t-sans); font-weight: var(--t-weight-bold);
  font-size: var(--pt-body); line-height: 1.25;
  border-radius: var(--r-sm); padding: 12pt 20pt; margin: 16pt 0 0;
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

/* Scaling-law breadcrumb */
.p-formula {
  font-family: var(--t-mono); font-weight: 500;
  font-size: 38pt; line-height: 1.1; letter-spacing: 0.01em;
  color: var(--c-accent-teal); margin: 0 0 12pt;
}
.p-formula sub, .p-formula sup { font-size: 0.6em; }

.fig__bed { background: var(--c-paper); display: grid; place-items: center; padding: 8mm; }

/* Distribute column slack evenly so both columns reach the footer cleanly */
.p-cols .p-col { justify-content: space-between; }
.p-col > * { margin-bottom: 0; }

/* Partner-mark treatments so each sits cleanly on warm paper */
.p-partner--multiply { mix-blend-mode: multiply; }
:root[data-theme="light"] .p-partner--invert { filter: invert(1); opacity: 0.8; }
:root[data-theme="dark"]  .p-partner--multiply { mix-blend-mode: screen; }

/* Header lab mark — the lab's drop-impact signature */
.p-logos__lab img { height: 62mm; }

/* Hero: top-align the lede so it starts level with the figure, not floating
   in the vertical centre of the tall graphical abstract. */
.p-hero { align-items: start; }
.p-hero__lede { padding-top: 4mm; }

/* Print fix: the base print rule collapses .poster to height:100% of a
   height-less .stage, so the poster shrinks to content height and the footer
   falls off the page. Re-assert true A0 so the body fills the sheet and the
   footer pins to the bottom. */
@media print {
  html, body { margin: 0 !important; height: auto !important; background: var(--c-surface-strong) !important; }
  .stage { position: static !important; height: auto !important; overflow: visible !important; background: none !important; }
  .stage::before { display: none !important; }
  .poster {
    position: static !important;
    transform: none !important;
    box-shadow: none !important;
    margin: 0 !important;
  }
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

function chip(c: Chip): string {
  const teal = c.tone === "teal" ? " p-chip--teal" : "";
  return `<span class="p-chip${teal}">${c.text}</span>`;
}

function img(src: string, alt: string, opts: RenderOptions, style = ""): string {
  const s = style ? ` style="${style}"` : "";
  return `<img src="${opts.resolveAsset(src)}" alt="${escAttr(alt)}"${s} />`;
}

function figure(fig: Figure, opts: RenderOptions, grow = false): string {
  const blend = fig.blend === false ? "" : "mix-blend-mode:multiply;";
  const cap = fig.caption
    ? `<figcaption class="fig__cap">${fig.caption}</figcaption>`
    : "";
  if (grow) {
    return `<figure class="fig fig--grow">
  <div class="fig__bed">${img(fig.src, fig.alt, opts, blend)}</div>
  ${cap}
</figure>`;
  }
  return `<figure class="fig">
  <div class="fig__bed">${img(fig.src, fig.alt, opts, `width:100%;height:auto;${blend}`)}</div>
  ${cap}
</figure>`;
}

function heading(num: string | undefined, text: string): string {
  const n = num ? `<span class="block__num">${num}</span> ` : "";
  return `<h2 class="block__h">${n}${text}</h2>`;
}

function renderBlock(block: Block, opts: RenderOptions): string {
  switch (block.kind) {
    case "section": {
      const chips = block.chips?.length
        ? `<div class="p-chips">${block.chips.map(chip).join("")}</div>`
        : "";
      const body = (block.body ?? []).map((p) => `<p>${p}</p>`).join("");
      const items = block.items?.length
        ? `<ul>${block.items.map((li) => `<li>${li}</li>`).join("")}</ul>`
        : "";
      const fig = block.figure ? figure(block.figure, opts, block.grow) : "";
      const outcome = block.outcome
        ? `<p class="p-outcome p-outcome--${block.outcome.tone}">${block.outcome.text}</p>`
        : "";
      const cls = block.grow ? "block block--grow" : "block";
      return `<section class="${cls}">
  ${heading(block.num, block.heading)}
  ${chips}
  ${body}
  ${items}
  ${fig}
  ${outcome}
</section>`;
    }
    case "key": {
      const body = (block.body ?? []).map((p) => `<p>${p}</p>`).join("");
      const items = block.items?.length
        ? `<ul>${block.items.map((li) => `<li>${li}</li>`).join("")}</ul>`
        : "";
      return `<section class="block block--key">
  ${heading(undefined, block.heading)}
  ${body}
  ${items}
</section>`;
    }
    case "scaling": {
      return `<section class="block block--key">
  ${heading(undefined, block.heading)}
  <div class="p-formula">${block.formula}</div>
  <p>${block.note}</p>
</section>`;
    }
    case "references": {
      const items = block.items.map((r) => `<li>${r}</li>`).join("");
      return `<section class="block">
  ${heading(block.num, block.heading)}
  <ol class="refs">${items}</ol>
</section>`;
    }
    case "acknowledgements": {
      return `<section class="block">
  ${heading(block.num, block.heading)}
  <p class="ack">${block.body}</p>
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
  const subtitle = meta.subtitle
    ? `<p class="p-subtitle">${meta.subtitle}</p>`
    : "";
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
  const blend = hero.figure.blend === false ? "" : "mix-blend-mode:multiply;";
  const cap = hero.figure.caption
    ? `<figcaption class="fig__cap">${hero.figure.caption}</figcaption>`
    : "";
  return `<section class="p-hero">
  <figure class="fig" style="margin:0;">
    <div class="fig__bed" style="padding:10mm;">
      ${img(hero.figure.src, hero.figure.alt, opts, `width:auto;max-width:100%;max-height:250mm;${blend}`)}
    </div>
    ${cap}
  </figure>
  <p class="p-hero__lede">${hero.lede}</p>
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
  const left = content.blocks
    .filter((b) => b.column === "left")
    .map((b) => renderBlock(b, opts))
    .join("\n");
  const right = content.blocks
    .filter((b) => b.column === "right")
    .map((b) => renderBlock(b, opts))
    .join("\n");

  const pageSize =
    meta.orientation === "landscape" ? "1189mm 841mm" : "841mm 1189mm";

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
