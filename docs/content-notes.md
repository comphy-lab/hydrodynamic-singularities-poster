# Content Notes

The poster is built on the **CoMPhy Lab design system** (A0). It is a
student-facing *introduction to hydrodynamic singularities*, **not** a companion
to a paper. Content lives in [`src/content.ts`](../src/content.ts); this file
records the narrative and design decisions.

The science draws on Verschuur, Oratis, Sanjay & Snoeijer, *How elasticity
affects bubble pinch-off* (arXiv:2511.20075), but the poster leads with the
phenomenon, not the paper. Equations are real LaTeX rendered by KaTeX; author the
maths in `$…$` / `$$…$$` (and the raw-LaTeX `scaling` / `compare` fields).

## Narrative (phenomenon → twist → why)

1. **Singularities are cool — and they erase memory.** When a free surface
   pinches off, the neck radius races to zero in finite time and the shape turns
   self-similar, `h ∼ (t₀−t)^α`, a universal form that *forgets how it began*.
   → the **hero**: a drop pinch-off time series, then a bubble one (the two
   Newtonian "Water" rows, cropped from the experimental figures). Drop scales
   as `(t₀−t)^{2/3}` (clean); bubble as `≈(t₀−t)^{1/2}` (leading order, with a
   weak log correction — keep it soft).

2. **The twist — elasticity is memory.** A dissolved polymer stores its
   stretching history over a relaxation time, so it should hand the memory back.
   It does for a **drop** (axial thread → strong stress `σ_zz ∼ G(h₀/h)⁴` →
   beads-on-a-string), but not for a dilute **bubble** (radial cavity → weak
   stress `σ_rr ∼ G(h₀/h)²` → pinches like water).

3. **Why the split — driving, resisting, geometry.** A drop is capillary-driven
   and axial; a bubble is inertia-driven and radial. Two extra powers of
   `(h₀/h)` decide whether a pinch of polymer can win; the elastocapillary
   number `Ec = G h₀/γ` sets the balance.

Physics verified (June 2026, multi-agent adversarial pass): all scalings and the
4-vs-2 stress contrast confirmed; the only hedge is the bubble's `½` log
correction. All references verified exact.

## Layout mapping (phenomenon-first)

| Slot | Content | Asset |
|---|---|---|
| Header | title, memory standfirst, author line, CoMPhy mark | `assets/logos/comphy-mark.png` |
| Hero — lede | what a singularity is + memory loss | — |
| Hero — strip 1 | *A drop pinches off* + `(t₀−t)^{2/3}` | `assets/figures/hero_drop_pinchoff.png` |
| Hero — strip 2 | *A bubble pinches off* + `(t₀−t)^{1/2}` | `assets/figures/hero_bubble_pinchoff.png` |
| Lead band | *Elasticity is memory* — the pivot (`place: "lead"`) | — |
| Left column | *The drop remembers* + coral verdict | `assets/figures/drop_experiment_two_rows.png` |
| Right column | *The bubble forgets anyway* + teal verdict | `assets/figures/bubble_experiment_two_rows.png` |
| Tail band | *Why elasticity picks sides* — drop-vs-bubble compare grid | — |
| Full-width endmatter | references (2-column) + acknowledgements | — |
| Footer | QR → comphy-lab.org, contact, partner marks | `assets/logos/{durham-university,physics-of-fluids,basilisk}.png` |

The hero strips (`hero_drop_pinchoff.png`, `hero_bubble_pinchoff.png`) are
**placeholders** cropped from the Newtonian rows of the experimental figures —
swap in final artwork when ready. The old paper-style hero
(`numerical_snapshots.png`) and the schematic `hero_scaling.png` are no longer
used in the layout.

## Figures

- **Hero strips** (`hero_drop_pinchoff.png`, `hero_bubble_pinchoff.png`) — the
  Newtonian ("Water") rows cropped from the experimental two-row figures, used as
  the phenomenon-first hero (drop time series, then bubble). **Placeholders** —
  swap in final artwork; keep the wide filmstrip aspect so the hero layout holds.
- **Experimental two-row figures** (drop / bubble columns) — Newtonian row vs
  dilute-polymer row; this is the elasticity evidence. Capped to a shared height
  so the two columns align.
- **Unused** — `numerical_snapshots.png` (the old paper-style graphical-abstract
  hero) and `hero_scaling.png` (the schematic h(t) plots from
  `scripts/make_scaling_plots.py`) are kept in `assets/` but no longer placed in
  the layout. Reinstate the scaling plots only if a quantitative panel is wanted.

## Visual direction

- On the lab design system, not the old blue-framed scaffold. Warm paper, one
  teal accent, the four-stop brand gradient only as the 6 mm top signature bar,
  a solid-ink Fraunces title for 2-metre legibility.
- Partner footer marks render monochrome (Durham via `multiply`, Physics of
  Fluids via `invert`); the CoMPhy mark and Basilisk stay in colour.

## To finalise before printing

- Swap the placeholder hero strips for final drop / bubble pinch-off artwork.
- Confirm the **byline** (currently the full paper author order, no superscript
  marks) — this is Vatsal's poster at his own event, so the order may want to
  change.
- References are verified exact (June 2026): host paper + Eggers RMP 1997,
  Day–Hinch–Lister 1998, Burton 2005, Clasen 2006, Eggers–Herrada–Snoeijer 2020;
  Popinet/Basilisk credited in the acknowledgements rather than the list.
- Check the print route and that the PDF is true A0 (the driver reports this).
