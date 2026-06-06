# Hydrodynamic Singularities Poster

A0 poster scaffold for a student-facing poster on hydrodynamic singularities.

## Overview

This repository generates an editable A0 poster skeleton for the Durham Physics
Staff-Student Research Poster Event on 12 June 2026. The current output is a
visual scaffold: large structure, placeholder copy, and vector illustrations for
pinch-off, coalescence, jets, sheets, and viscoelastic beads-on-a-string.

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

This is deliberately a skeleton. The content pass should replace the placeholder
panel text with the final undergraduate-facing narrative and real simulation or
figure assets where useful.
