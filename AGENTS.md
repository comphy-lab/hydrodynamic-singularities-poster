# Hydrodynamic Singularities Poster

A0 poster for the Durham Physics Staff–Student Research Poster Event (12 June
2026), built on the **CoMPhy Lab design system**. HTML/CSS for the design, a
small TypeScript layer for content + rendering, and Python as the render driver.

## Structure

```text
hydrodynamic-singularities-poster/
├── design-system/   CoMPhy Lab system, vendored from the design handoff (upstream)
│   ├── tokens.css      colours, type, spacing — the source of truth
│   ├── poster.css      A0 academic-poster layout
│   └── poster-fit.js   on-screen scaling (print prints 1:1 at A0)
├── src/             the poster as typed data + a renderer
│   ├── content.ts      the poster's words, figures, references  ← edit for content
│   ├── types.ts        the content model
│   ├── poster.ts       content → design-system HTML (layout lives here)
│   └── build.ts        inline CSS/JS + images → standalone outputs/poster.html
├── scripts/
│   └── make_poster.py  the driver: QR → build → A0 PDF → PNG
├── assets/          logos + real science figures (experimental + numerical crops)
├── outputs/         poster.html (standalone), PDF (print this), PNG (preview)
├── package.json · tsconfig.json   TS toolchain (tsx)
├── Makefile · README.md
```

## Development

```bash
make            # full pipeline: QR → HTML → true-A0 PDF + PNG
make html       # rebuild standalone HTML only (src/content.ts → outputs/poster.html)
make pdf        # render PDF from existing HTML (no Node needed)
make setup      # npm install (one-off, installs tsx)
make typecheck  # tsc --noEmit
```

Render engine is **headless Chrome** (`--print-to-pdf`), which honours the
`@page { size: 841mm 1189mm }` rule for true A0. The driver degrades gracefully:
no Node → renders the committed HTML; no `pdftoppm` → Chrome screenshot → `sips`;
no QR tooling → the design system's placeholder.

## Guidelines

- **Edit content in `src/content.ts`**, not the generated HTML. Layout changes go
  in `src/poster.ts`; system-level styling stays in `design-system/`.
- **Treat `design-system/` as upstream** — change it only to pull a newer version
  of the lab system, and keep it faithful to the handoff so other CoMPhy
  artifacts stay on-system.
- **Stay on-system** (see `design-system/README.md`): warm paper not white, one
  teal accent, the brand gradient only as the top signature bar, a solid-ink
  title (never gradient-clipped) for 2-metre legibility, three type roles.
- **Keep it A0** unless asked for another print size. Portrait is default;
  `make landscape` swaps orientation.
- **Keep content student-facing**: mechanism, a visual example, one scaling
  breadcrumb. The science is the drop-vs-bubble singularity contrast — don't
  drop it in a redesign.
- **Logos are vector SVGs** generated from the PDF masters in `assets/logos/`
  (`make logos`, via `pdftocairo`); the build inlines the SVG so each mark stays
  a true vector with transparency — crisp at any zoom, no white box on paper.
  Durham blends to paper via `mix-blend-mode: multiply`; the CoMPhy mark,
  Physics of Fluids and Basilisk render in full colour (`treatment: "normal"`).
- Committed `outputs/` artifacts and `assets/` (logos, figures, QR) are
  intentionally tracked. `node_modules/` is not.
- Do not commit private correspondence, event emails, or screenshots.
- Verify the references in `src/content.ts` before printing.
