# CoMPhy Lab — Design System (vendored)

These three files are the **CoMPhy Lab visual language**, vendored verbatim from
the *CoMPhy Lab poster design* handoff (Claude Design). They are the single
source of truth for colour, type, spacing and the A0 poster layout.

| File | Purpose |
|---|---|
| `tokens.css` | Design tokens — paper/ink surfaces, four-stop brand gradient, the one teal accent, the three type families (Cormorant hero, Fraunces headings, IBM Plex body/mono). Source of truth. |
| `poster.css` | A0 academic-poster layout built on `tokens.css`. Portrait/landscape × hero-band/side-rail. |
| `poster-fit.js` | Scales the poster to fit the screen; print clears the transform and prints 1:1 at A0. |

Load order is always **fonts → `tokens.css` → `poster.css` → `poster-fit.js`**.
The build inlines all three into the generated `outputs/poster.html`, so nothing
here is referenced at print time — these files are the editable upstream.

## Don't hand-edit to "fix" the poster

Poster content lives in [`src/content.ts`](../src/content.ts); layout lives in
[`src/poster.ts`](../src/poster.ts). Treat `design-system/` as upstream: change it
only to pull a newer version of the lab system, and keep changes faithful to the
handoff so other CoMPhy artifacts (site, slides, microsites) stay on-system.

The non-negotiables (from the system's own `SKILL.md`):

- **Paper, not white.** Body is `--c-paper` (`#f3efe8`).
- **Teal is the only interactive accent** (`--c-accent-teal`, `#254c4a`).
- **The brand gradient is one bar** — the 6 mm signature rule across the top.
  The poster title is solid ink for 2-metre legibility, never gradient-clipped.
- **Three type roles:** Cormorant = hero only, Fraunces = headings, IBM Plex =
  everything else, Plex Mono for code/DOIs.
- **Partner marks are monochrome/white**; the CoMPhy mark and Basilisk stay in colour.

— System maintained by V. Sanjay · Durham University
