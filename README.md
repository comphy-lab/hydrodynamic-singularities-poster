# Hydrodynamic Singularities Poster

A0 poster scaffold for a student-facing poster on hydrodynamic singularities.

## Overview

This repository generates an editable A0 poster skeleton for the Durham Physics
Staff-Student Research Poster Event on 12 June 2026. The current output is a
working scaffold: large structure, real experimental sequences, numerical
snapshots, and editable text around the drop-versus-bubble singularity story.

## Build

```bash
python3 scripts/make_a0_poster.py
```

or:

```bash
make
```

Generated assets:

- `outputs/hydrodynamic_singularities_poster.svg`
- `outputs/hydrodynamic_singularities_poster.pdf`
- `outputs/hydrodynamic_singularities_poster.png`
- `assets/logos/physics-of-fluids.png`
- `assets/logos/comphy-lab.png`
- `assets/logos/durham-university.png`
- `assets/figures/drop_experiment_two_rows.png`
- `assets/figures/bubble_experiment_two_rows.png`
- `assets/figures/numerical_snapshots.png`

The SVG is the editable source. The PDF is the print-facing export. The PNG is
a quick visual preview.

## Requirements

- Python 3.10+
- Optional: `rsvg-convert` for PDF/PNG export from SVG

On macOS with Homebrew:

```bash
brew install librsvg
```

## Notes

This is deliberately still a skeleton for later content passes. The current
version fixes the first-pass narrative: singularities make a system forget its
memory, Newtonian drop and bubble pinch-off are singular, polymers suppress the
drop singularity into beads-on-a-string, and polymers leave bubble pinch-off
nearly unchanged.

The current layout is informed by Vatsal's earlier LMC/JMBC posters and the
Solidifying Jets student poster: centred title, blue framed sections, a dominant
middle visual sequence, and a footer logo strip with the CoMPhy Lab logo centred.
