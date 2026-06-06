# Hydrodynamic Singularities Poster

This repo builds an A0 poster scaffold for a Durham Physics staff-student research poster event.

## Structure

```text
hydrodynamic-singularities-poster/
├── scripts/      # Poster-generation scripts
├── outputs/      # Generated SVG/PDF/PNG poster assets
├── docs/         # Notes for later content passes
├── README.md
└── Makefile
```

## Development

```bash
python3 scripts/make_a0_poster.py
# or
make
```

The script writes `outputs/hydrodynamic_singularities_poster.svg` and uses
`rsvg-convert` when available to export PDF and PNG.

## Guidelines

- Keep the poster A0-sized unless Vatsal asks for another print format.
- Keep the CoMPhy Lab logo centred in the footer; Physics of Fluids sits left,
  Durham University sits right.
- Keep content student-facing: mechanism, visual example, one scaling breadcrumb.
- Prefer vector geometry and editable text over flattened raster art.
- Generated final assets in `outputs/` are allowed in version control.
- Copied logo assets in `assets/logos/` are intentionally committed.
- Do not commit private correspondence, event emails, or screenshots.
