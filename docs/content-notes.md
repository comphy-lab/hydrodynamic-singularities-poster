# Content Notes

The poster is built on the **CoMPhy Lab design system** (hero-band A0 layout).
Content lives in [`src/content.ts`](../src/content.ts); this file records the
narrative and the design decisions behind it.

## Narrative

A singularity is a smooth physical process that blows up — a finite quantity
becoming infinite in a finite time or place. The poster makes the **memory-loss**
idea explicit: close to the singularity the flow becomes universal and
self-similar, forgetting its initial condition.

The spine is the **drop vs bubble** contrast:

- **Drops** — a Newtonian neck pinches to a true finite-time singularity. Add
  polymers and the singularity is *arrested*: a persistent filament,
  beads-on-a-string. *Elasticity changes the route.*
- **Bubbles** — a Newtonian neck pinches just as sharply. Add the same polymers
  and the near-singular sequence is almost unchanged. *Elasticity leaves the
  singularity intact.*

Equations are kept sparse: one scaling-law breadcrumb
(`h_min ∼ (t₀ − t)^α`, self-similar collapse under rescaling by the local neck
radius).

## Layout mapping (hero-band)

| Slot | Content | Asset |
|---|---|---|
| Header | title, standfirst, author, CoMPhy mark | `assets/logos/comphy-mark.png` |
| Hero | graphical abstract + lede (singularity + memory loss + the punchline) | `assets/figures/numerical_snapshots.png` |
| 01 (left) | *What is a singularity?* — concentration, memory loss, self-similarity | — |
| scaling (left) | the self-similar fingerprint breadcrumb | — |
| 02 (left) | *Drops: elasticity changes the route* + coral verdict | `assets/figures/drop_experiment_two_rows.png` |
| 03 (right) | *Bubbles: elasticity leaves the singularity intact* + teal verdict | `assets/figures/bubble_experiment_two_rows.png` |
| key (right) | *What it tells us* — the conclusions | — |
| 04 / 05 (right) | references, acknowledgements | — |
| Footer | QR → comphy-lab.org, contact, partner marks | `assets/logos/{durham-university,physics-of-fluids,basilisk}.png` |

## Figures

- **Numerical snapshots** (hero) — the controlled Basilisk comparison: bubble and
  drop necks, Newtonian vs viscoelastic. The clearest single statement of the
  result, so it leads.
- **Experimental crops** (sections 2–3) — deliberately keep only the Newtonian
  and elastic rows; the third row from the source PDFs is ignored.

## Visual direction

- On the lab design system, not the old blue-framed scaffold. Warm paper, one
  teal accent, the four-stop brand gradient only as the 6 mm top signature bar,
  a solid-ink Fraunces title for 2-metre legibility.
- Partner footer marks render monochrome (Durham via `multiply`, Physics of
  Fluids via `invert`); the CoMPhy mark and Basilisk stay in colour.

## To finalise before printing

- Verify/curate the references in `src/content.ts` (currently canonical
  starting points: Eggers 1997; Day–Hinch–Lister 1998; Clasen 2006; Basilisk).
- Confirm author list / acknowledgements.
- Check the print route and that the PDF is true A0 (the driver reports this).
