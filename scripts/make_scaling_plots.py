#!/usr/bin/env python3
"""Generate the hero h(t) scaling figure for the poster.

Two panels — a drop and a bubble — each a schematic neck-radius plot:

  main:  h(t) vs t           (axes only, ready for data — drop yours in below)
  inset: h vs (t0 - t)       (log-log, with the 1/2 self-similar scaling guide)

Output: assets/figures/hero_scaling.png (transparent, for the warm-paper hero).

Run:
    python3 scripts/make_scaling_plots.py
    # or, with no system matplotlib:
    uv run --with 'matplotlib' python3 scripts/make_scaling_plots.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import rcParams  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "figures" / "hero_scaling.png"

# Design-system palette (paper + ink, one teal accent, coral for the key noun).
INK = "#1f1a15"
CORAL = "#cf4900"   # drop verdict
TEAL = "#254c4a"    # bubble verdict
MUTED = "#625648"

rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["IBM Plex Sans", "DejaVu Sans"],
    "mathtext.fontset": "cm",
    "text.color": INK,
    "axes.edgecolor": INK,
    "axes.labelcolor": INK,
    "xtick.color": INK,
    "ytick.color": INK,
    "axes.linewidth": 1.8,
    "savefig.transparent": True,
})

PANELS = [
    {"name": "Drop", "accent": CORAL},
    {"name": "Bubble", "accent": TEAL},
]


def style_main(ax) -> None:
    """A clean half-box, schematic axes with arrowheads — ready for h(t) data."""
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    # arrowheads on the open ends → schematic axes
    ax.plot(1, 0, ">", color=INK, transform=ax.transAxes, clip_on=False, ms=9)
    ax.plot(0, 1, "^", color=INK, transform=ax.transAxes, clip_on=False, ms=9)
    ax.set_xlabel(r"$t$", fontsize=20)
    ax.set_ylabel(r"$h(t)$", fontsize=20, rotation=0, ha="right", va="center", labelpad=14)


def add_inset(ax, accent: str) -> None:
    """Log-log inset of h vs (t0 - t) with the slope-1/2 self-similar guide."""
    ins = ax.inset_axes([0.46, 0.50, 0.50, 0.46])
    x = np.logspace(-3.0, 0.0, 60)
    ins.plot(x, x ** 0.5, ls="--", lw=2.4, color=accent)
    ins.set_xscale("log")
    ins.set_yscale("log")
    ins.set_xticklabels([])
    ins.set_yticklabels([])
    ins.tick_params(length=3, width=1.0)
    for s in ins.spines.values():
        s.set_linewidth(1.3)
    ins.set_xlabel(r"$t_0 - t$", fontsize=12, labelpad=2)
    ins.set_ylabel(r"$h$", fontsize=12, rotation=0, labelpad=6, va="center")
    ins.annotate(
        r"slope $\,1/2$",
        xy=(10 ** -1.4, (10 ** -1.4) ** 0.5),
        xytext=(10 ** -2.7, 10 ** -0.55),
        fontsize=11, color=accent,
    )


def main() -> None:
    fig, axes = plt.subplots(1, 2, figsize=(12.6, 4.1))
    for ax, panel in zip(axes, PANELS):
        style_main(ax)
        ax.set_title(panel["name"], loc="left", fontsize=18, fontweight="bold",
                     color=panel["accent"], pad=12)
        add_inset(ax, panel["accent"])

        # --- DROP YOUR DATA HERE -------------------------------------------
        # t, h = load_neck_radius(panel["name"])
        # ax.plot(t, h, color=panel["accent"], lw=2.6)
        # inset: ax2.plot(t0 - t, h, color=panel["accent"], lw=2.0)
        # -------------------------------------------------------------------

    fig.subplots_adjust(left=0.07, right=0.985, top=0.9, bottom=0.16, wspace=0.28)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUT, dpi=220, transparent=True)
    print(f"wrote {OUT.relative_to(ROOT)}  ({fig.get_size_inches()[0]:.0f}x{fig.get_size_inches()[1]:.0f}in @220dpi)")


if __name__ == "__main__":
    main()
