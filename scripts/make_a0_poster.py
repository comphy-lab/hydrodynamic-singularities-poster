#!/usr/bin/env python3
"""Generate an A0 SVG/PDF/PNG poster scaffold.

The poster is intentionally vector-first: the SVG is the editable source, while
PDF and PNG are convenience exports when `rsvg-convert` is available.
"""

from __future__ import annotations

import argparse
import html
import shutil
import subprocess
import textwrap
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "outputs"
POSTER_STEM = "hydrodynamic_singularities_poster"

A0_WIDTH_MM = 841
A0_HEIGHT_MM = 1189

COLORS = {
    "ink": "#17202A",
    "muted": "#4B5563",
    "paper": "#F8FAFC",
    "line": "#CBD5E1",
    "blue": "#0B6E8E",
    "teal": "#0F8B8D",
    "red": "#C2410C",
    "gold": "#B7791F",
    "green": "#2F855A",
    "violet": "#6B46C1",
    "panel": "#FFFFFF",
    "panel_alt": "#EFF6FF",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=OUTPUT_DIR,
        help="Directory for generated poster assets.",
    )
    parser.add_argument(
        "--preview-width",
        type=int,
        default=1800,
        help="Pixel width for the PNG preview exported via rsvg-convert.",
    )
    parser.add_argument(
        "--no-convert",
        action="store_true",
        help="Only write SVG; skip PDF/PNG conversion.",
    )
    return parser.parse_args()


def attrs(**kwargs: object) -> str:
    parts: list[str] = []
    for key, value in kwargs.items():
        if value is None:
            continue
        name = key.replace("_", "-")
        parts.append(f'{name}="{html.escape(str(value), quote=True)}"')
    return " ".join(parts)


def tag(name: str, content: str = "", **kwargs: object) -> str:
    attr_text = attrs(**kwargs)
    if content:
        if attr_text:
            return f"<{name} {attr_text}>{content}</{name}>"
        return f"<{name}>{content}</{name}>"
    if attr_text:
        return f"<{name} {attr_text}/>"
    return f"<{name}/>"


def text_lines(
    text: str,
    *,
    x: float,
    y: float,
    width_chars: int,
    size: float,
    fill: str = COLORS["ink"],
    weight: int = 400,
    line_height: float = 1.22,
    anchor: str = "start",
    family: str = "Inter, Helvetica, Arial, sans-serif",
) -> str:
    wrapped = textwrap.wrap(text, width=width_chars, break_long_words=False)
    tspans: list[str] = []
    for idx, line in enumerate(wrapped):
        dy = 0 if idx == 0 else size * line_height
        tspans.append(
            tag(
                "tspan",
                html.escape(line),
                x=x,
                dy=f"{dy:.2f}",
            )
        )
    return tag(
        "text",
        "".join(tspans),
        x=x,
        y=y,
        fill=fill,
        **{
            "font-size": size,
            "font-family": family,
            "font-weight": weight,
            "text-anchor": anchor,
        },
    )


def rect(x: float, y: float, w: float, h: float, **kwargs: object) -> str:
    return tag("rect", x=x, y=y, width=w, height=h, **kwargs)


def circle(cx: float, cy: float, r: float, **kwargs: object) -> str:
    return tag("circle", cx=cx, cy=cy, r=r, **kwargs)


def path(d: str, **kwargs: object) -> str:
    return tag("path", d=d, **kwargs)


def line(x1: float, y1: float, x2: float, y2: float, **kwargs: object) -> str:
    return tag("line", x1=x1, y1=y1, x2=x2, y2=y2, **kwargs)


def panel(x: float, y: float, w: float, h: float, title: str, body: str) -> str:
    parts = [
        rect(x, y, w, h, rx=6, fill=COLORS["panel"], stroke=COLORS["line"], **{"stroke-width": 1.1}),
        rect(x, y, w, 20, rx=6, fill=COLORS["panel_alt"]),
        text_lines(title, x=x + 13, y=y + 44, width_chars=24, size=12.6, weight=850),
        text_lines(body, x=x + 13, y=y + 91, width_chars=37, size=8.0, fill=COLORS["muted"]),
    ]
    return tag("g", "\n".join(parts))


def mechanism_tile(
    x: float,
    y: float,
    w: float,
    h: float,
    title: str,
    subtitle: str,
    drawing: str,
    accent: str,
) -> str:
    parts = [
        rect(x, y, w, h, rx=5, fill="#FFFFFF", stroke=COLORS["line"], **{"stroke-width": 0.9}),
        rect(x, y, 5, h, rx=5, fill=accent),
        drawing,
        text_lines(title, x=x + 13, y=y + h - 31, width_chars=20, size=10.8, weight=800),
        text_lines(subtitle, x=x + 13, y=y + h - 15, width_chars=31, size=5.7, fill=COLORS["muted"]),
    ]
    return tag("g", "\n".join(parts))


def draw_pinchoff(cx: float, cy: float, scale: float, color: str) -> str:
    d = (
        f"M {cx - 42*scale:.2f} {cy - 42*scale:.2f} "
        f"C {cx - 13*scale:.2f} {cy - 30*scale:.2f}, {cx - 10*scale:.2f} {cy - 7*scale:.2f}, {cx:.2f} {cy:.2f} "
        f"C {cx + 10*scale:.2f} {cy + 7*scale:.2f}, {cx + 13*scale:.2f} {cy + 30*scale:.2f}, {cx + 42*scale:.2f} {cy + 42*scale:.2f}"
    )
    neck = (
        f"M {cx - 42*scale:.2f} {cy + 42*scale:.2f} "
        f"C {cx - 13*scale:.2f} {cy + 30*scale:.2f}, {cx - 10*scale:.2f} {cy + 7*scale:.2f}, {cx:.2f} {cy:.2f} "
        f"C {cx + 10*scale:.2f} {cy - 7*scale:.2f}, {cx + 13*scale:.2f} {cy - 30*scale:.2f}, {cx + 42*scale:.2f} {cy - 42*scale:.2f}"
    )
    return tag(
        "g",
        "\n".join(
            [
                path(d, fill="none", stroke=color, **{"stroke-width": 5 * scale, "stroke-linecap": "round"}),
                path(neck, fill="none", stroke=color, **{"stroke-width": 5 * scale, "stroke-linecap": "round"}),
                circle(cx, cy, 4.2 * scale, fill="#FFFFFF", stroke=COLORS["red"], **{"stroke-width": 1.5 * scale}),
            ]
        ),
    )


def draw_coalescence(cx: float, cy: float, scale: float, color: str) -> str:
    return tag(
        "g",
        "\n".join(
            [
                circle(cx - 25 * scale, cy, 28 * scale, fill="none", stroke=color, **{"stroke-width": 4 * scale}),
                circle(cx + 25 * scale, cy, 28 * scale, fill="none", stroke=color, **{"stroke-width": 4 * scale}),
                rect(cx - 16 * scale, cy - 7 * scale, 32 * scale, 14 * scale, rx=7 * scale, fill=COLORS["red"], opacity=0.9),
                line(cx, cy - 33 * scale, cx, cy + 33 * scale, stroke=COLORS["line"], **{"stroke-width": 1.1 * scale, "stroke-dasharray": f"{3*scale} {3*scale}"}),
            ]
        ),
    )


def draw_jet(cx: float, cy: float, scale: float, color: str) -> str:
    d = (
        f"M {cx - 34*scale:.2f} {cy + 30*scale:.2f} "
        f"C {cx - 10*scale:.2f} {cy + 10*scale:.2f}, {cx - 5*scale:.2f} {cy - 8*scale:.2f}, {cx:.2f} {cy - 48*scale:.2f} "
        f"C {cx + 5*scale:.2f} {cy - 8*scale:.2f}, {cx + 10*scale:.2f} {cy + 10*scale:.2f}, {cx + 34*scale:.2f} {cy + 30*scale:.2f}"
    )
    return tag(
        "g",
        "\n".join(
            [
                path(d, fill="#E0F2FE", stroke=color, **{"stroke-width": 3 * scale}),
                circle(cx, cy - 58 * scale, 6.5 * scale, fill=COLORS["red"]),
                circle(cx, cy - 76 * scale, 3.8 * scale, fill=COLORS["gold"]),
            ]
        ),
    )


def draw_sheet(cx: float, cy: float, scale: float, color: str) -> str:
    d = (
        f"M {cx - 50*scale:.2f} {cy + 4*scale:.2f} "
        f"C {cx - 26*scale:.2f} {cy - 26*scale:.2f}, {cx + 26*scale:.2f} {cy - 26*scale:.2f}, {cx + 50*scale:.2f} {cy + 4*scale:.2f}"
    )
    parts = [path(d, fill="none", stroke=color, **{"stroke-width": 5 * scale, "stroke-linecap": "round"})]
    for i in range(7):
        px = cx - 42 * scale + i * 14 * scale
        py = cy + (10 + (i % 2) * 5) * scale
        parts.append(circle(px, py, (2.5 + 0.4 * (i % 3)) * scale, fill=COLORS["red"], opacity=0.85))
    return tag("g", "\n".join(parts))


def draw_beads(cx: float, cy: float, scale: float, color: str) -> str:
    parts = [
        line(cx - 48 * scale, cy, cx + 48 * scale, cy, stroke=color, **{"stroke-width": 2.6 * scale, "stroke-linecap": "round"})
    ]
    radii = [12, 5, 8, 4, 10]
    xs = [-38, -16, 4, 23, 42]
    for xoff, radius in zip(xs, radii):
        parts.append(circle(cx + xoff * scale, cy, radius * scale, fill="#F5E8FF", stroke=color, **{"stroke-width": 2 * scale}))
    return tag("g", "\n".join(parts))


def hero_visual() -> str:
    cx, cy = 420.5, 272
    parts = [
        circle(cx, cy, 146, fill="#E0F2FE", opacity=0.65),
        circle(cx, cy, 112, fill="#FFFFFF", stroke="#BAE6FD", **{"stroke-width": 2}),
        draw_pinchoff(cx, cy, 2.45, COLORS["blue"]),
        circle(cx, cy, 8, fill=COLORS["red"]),
        text_lines("near-singular neck", x=cx + 82, y=cy - 79, width_chars=22, size=9.5, fill=COLORS["red"], weight=800),
        line(cx + 58, cy - 38, cx + 11, cy - 4, stroke=COLORS["red"], **{"stroke-width": 1.3}),
        text_lines("local length scale collapses", x=cx - 196, y=cy + 112, width_chars=31, size=9.5, fill=COLORS["muted"], weight=700),
        line(cx - 50, cy + 77, cx - 10, cy + 12, stroke=COLORS["muted"], **{"stroke-width": 1.1, "stroke-dasharray": "4 4"}),
    ]
    return tag("g", "\n".join(parts))


def build_svg() -> str:
    parts: list[str] = []
    parts.append(rect(0, 0, A0_WIDTH_MM, A0_HEIGHT_MM, fill=COLORS["paper"]))
    parts.append(rect(0, 0, A0_WIDTH_MM, 178, fill="#FFFFFF"))
    parts.append(rect(0, 171, A0_WIDTH_MM, 7, fill=COLORS["blue"]))
    parts.append(
        text_lines(
            "Hydrodynamic Singularities",
            x=58,
            y=74,
            width_chars=32,
            size=35,
            weight=900,
        )
    )
    parts.append(
        text_lines(
            "When smooth flows focus geometry, stress, and time into a tiny region",
            x=60,
            y=119,
            width_chars=80,
            size=14,
            fill=COLORS["muted"],
            weight=500,
        )
    )
    parts.append(
        text_lines(
            "CoMPhy Lab | Department of Physics | Durham University",
            x=60,
            y=150,
            width_chars=72,
            size=8.8,
            fill=COLORS["muted"],
            weight=700,
        )
    )
    parts.append(
        text_lines(
            "A0 scaffold | replace placeholders with final figures and narrative",
            x=780,
            y=150,
            width_chars=38,
            size=7,
            fill=COLORS["muted"],
            anchor="end",
        )
    )

    parts.append(hero_visual())

    mechanism_y = 450
    tile_w = 142
    gap = 13
    x0 = 42
    drawings = [
        draw_pinchoff(x0 + 71, mechanism_y + 52, 0.82, COLORS["blue"]),
        draw_coalescence(x0 + tile_w + gap + 71, mechanism_y + 52, 0.86, COLORS["teal"]),
        draw_jet(x0 + 2 * (tile_w + gap) + 71, mechanism_y + 67, 0.76, COLORS["green"]),
        draw_sheet(x0 + 3 * (tile_w + gap) + 71, mechanism_y + 52, 0.82, COLORS["gold"]),
        draw_beads(x0 + 4 * (tile_w + gap) + 71, mechanism_y + 52, 0.84, COLORS["violet"]),
    ]
    titles = ["Pinch-off", "Coalescence", "Jets", "Sheets", "Elastic threads"]
    subtitles = [
        "minimum radius selects the clock",
        "a microscopic bridge reshapes both drops",
        "focusing launches fast tips and droplets",
        "rims, holes, and ligaments compete",
        "rheology changes the route to breakup",
    ]
    accents = [COLORS["blue"], COLORS["teal"], COLORS["green"], COLORS["gold"], COLORS["violet"]]
    for i in range(5):
        x = x0 + i * (tile_w + gap)
        parts.append(mechanism_tile(x, mechanism_y, tile_w, 137, titles[i], subtitles[i], drawings[i], accents[i]))

    panel_y = 642
    panel_w = 236
    panel_h = 248
    panel_gap = 24
    panel_text = [
        (
            "1. What becomes singular?",
            "A smooth interface develops a neck, bridge, rim, or tip whose local length scale becomes much smaller than the surrounding flow. The global object looks simple; the decisive physics lives in a small inner region.",
        ),
        (
            "2. What resolves it?",
            "Inertia, viscosity, surface tension, gas flow, contact-line physics, elasticity, and molecular cutoffs can each set the final balance. The useful question is not just whether breakup happens, but which balance controls the path.",
        ),
        (
            "3. Why should students care?",
            "A tiny region controls printing, spraying, foams, emulsions, bubbles, jets, and soft biological flows. Singularities are where continuum mechanics shows both its power and its limits.",
        ),
    ]
    for i, (title, body) in enumerate(panel_text):
        parts.append(panel(50 + i * (panel_w + panel_gap), panel_y, panel_w, panel_h, title, body))

    parts.append(rect(50, 930, 741, 142, rx=6, fill="#17202A"))
    parts.append(text_lines("Scaling breadcrumbs for later content", x=72, y=964, width_chars=45, size=17, fill="#FFFFFF", weight=850))
    crumbs = [
        ("Capillary time", "t_c ~ sqrt(rho R^3 / sigma)"),
        ("Pinch-off", "r_min -> 0 in a self-similar inner flow"),
        ("Coalescence", "bridge radius couples local curvature to global motion"),
        ("Soft matter", "Oh, We, Ca, De, Wi decide the dominant balance"),
    ]
    for i, (label, equation) in enumerate(crumbs):
        x = 74 + i * 178
        parts.append(rect(x, 988, 158, 54, rx=5, fill="#FFFFFF", opacity=0.1))
        parts.append(text_lines(label, x=x + 10, y=1008, width_chars=20, size=7.2, fill="#BAE6FD", weight=800))
        parts.append(text_lines(equation, x=x + 10, y=1028, width_chars=23, size=7.4, fill="#FFFFFF", weight=650))

    parts.append(line(50, 1110, 791, 1110, stroke=COLORS["line"], **{"stroke-width": 1.0}))
    parts.append(
        text_lines(
            "Placeholder footer: add QR code, contact, key references, and final figure credits here.",
            x=60,
            y=1140,
            width_chars=110,
            size=8.3,
            fill=COLORS["muted"],
        )
    )

    defs = """
    <style>
      text { dominant-baseline: alphabetic; }
      .smallcaps { letter-spacing: 0.08em; }
    </style>
    """
    body = "\n".join(parts)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{A0_WIDTH_MM}mm" '
        f'height="{A0_HEIGHT_MM}mm" viewBox="0 0 {A0_WIDTH_MM} {A0_HEIGHT_MM}" '
        f'version="1.1">\n<defs>{defs}</defs>\n{body}\n</svg>\n'
    )


def convert_with_rsvg(svg_path: Path, output_dir: Path, preview_width: int) -> None:
    converter = shutil.which("rsvg-convert")
    if not converter:
        print("rsvg-convert not found; wrote SVG only.")
        return

    pdf_path = output_dir / f"{POSTER_STEM}.pdf"
    png_path = output_dir / f"{POSTER_STEM}.png"
    preview_height = round(preview_width * A0_HEIGHT_MM / A0_WIDTH_MM)

    subprocess.run([converter, "-f", "pdf", "-o", str(pdf_path), str(svg_path)], check=True)
    subprocess.run(
        [
            converter,
            "-f",
            "png",
            "-w",
            str(preview_width),
            "-h",
            str(preview_height),
            "-o",
            str(png_path),
            str(svg_path),
        ],
        check=True,
    )
    print(f"Wrote {pdf_path}")
    print(f"Wrote {png_path}")


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    svg_path = args.output_dir / f"{POSTER_STEM}.svg"
    svg_path.write_text(build_svg(), encoding="utf-8")
    print(f"Wrote {svg_path}")
    if not args.no_convert:
        convert_with_rsvg(svg_path, args.output_dir, args.preview_width)


if __name__ == "__main__":
    main()
