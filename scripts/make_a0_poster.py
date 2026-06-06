#!/usr/bin/env python3
"""Generate an A0 SVG/PDF/PNG poster scaffold."""

from __future__ import annotations

import argparse
import base64
import html
import shutil
import subprocess
import textwrap
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "outputs"
LOGO_DIR = ROOT / "assets" / "logos"
POSTER_STEM = "hydrodynamic_singularities_poster"

A0_WIDTH_MM = 841
A0_HEIGHT_MM = 1189

COLORS = {
    "navy": "#173E6C",
    "blue": "#1D4F91",
    "pale_blue": "#DCEEFF",
    "paper": "#FFFFFF",
    "ink": "#111827",
    "muted": "#4B5563",
    "line": "#173E6C",
    "red": "#C2410C",
    "orange": "#F97316",
    "yellow": "#FACC15",
    "teal": "#0F8B8D",
    "green": "#2F855A",
    "violet": "#6B46C1",
    "soft_panel": "#F7FBFF",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR)
    parser.add_argument("--preview-width", type=int, default=1800)
    parser.add_argument("--no-convert", action="store_true")
    return parser.parse_args()


def attrs(**kwargs: object) -> str:
    values: list[str] = []
    for key, value in kwargs.items():
        if value is None:
            continue
        values.append(f'{key.replace("_", "-")}="{html.escape(str(value), quote=True)}"')
    return " ".join(values)


def tag(name: str, content: str = "", **kwargs: object) -> str:
    attr_text = attrs(**kwargs)
    if content:
        return f"<{name} {attr_text}>{content}</{name}>" if attr_text else f"<{name}>{content}</{name}>"
    return f"<{name} {attr_text}/>" if attr_text else f"<{name}/>"


def rect(x: float, y: float, w: float, h: float, **kwargs: object) -> str:
    return tag("rect", x=x, y=y, width=w, height=h, **kwargs)


def circle(cx: float, cy: float, r: float, **kwargs: object) -> str:
    return tag("circle", cx=cx, cy=cy, r=r, **kwargs)


def ellipse(cx: float, cy: float, rx: float, ry: float, **kwargs: object) -> str:
    return tag("ellipse", cx=cx, cy=cy, rx=rx, ry=ry, **kwargs)


def path(d: str, **kwargs: object) -> str:
    return tag("path", d=d, **kwargs)


def line(x1: float, y1: float, x2: float, y2: float, **kwargs: object) -> str:
    return tag("line", x1=x1, y1=y1, x2=x2, y2=y2, **kwargs)


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
    family: str = "Avenir Next, Helvetica Neue, Helvetica, Arial, sans-serif",
) -> str:
    wrapped = textwrap.wrap(text, width=width_chars, break_long_words=False)
    tspans: list[str] = []
    for idx, line_text in enumerate(wrapped):
        dy = 0 if idx == 0 else size * line_height
        tspans.append(tag("tspan", html.escape(line_text), x=x, dy=f"{dy:.2f}"))
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


def image_data_uri(path: Path) -> str:
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{data}"


def image(path: Path, x: float, y: float, w: float, h: float, **kwargs: object) -> str:
    return tag(
        "image",
        x=x,
        y=y,
        width=w,
        height=h,
        href=image_data_uri(path),
        preserveAspectRatio=kwargs.pop("preserveAspectRatio", "xMidYMid meet"),
        **kwargs,
    )


def section_box(x: float, y: float, w: float, h: float, title: str, content: list[str]) -> str:
    body = [
        rect(x, y, w, h, rx=17, fill=COLORS["paper"], stroke=COLORS["navy"], **{"stroke-width": 2.3}),
        text_lines(title.upper(), x=x + w / 2, y=y + 27, width_chars=54, size=13.6, fill=COLORS["blue"], weight=900, anchor="middle"),
    ]
    body.extend(content)
    return tag("g", "\n".join(body))


def draw_pinchoff(cx: float, cy: float, scale: float, color: str, neck: float = 1.0) -> str:
    waist = 8 * scale * neck
    upper = (
        f"M {cx - 38*scale:.2f} {cy - 44*scale:.2f} "
        f"C {cx - 16*scale:.2f} {cy - 35*scale:.2f}, {cx - waist:.2f} {cy - 10*scale:.2f}, {cx:.2f} {cy:.2f} "
        f"C {cx + waist:.2f} {cy + 10*scale:.2f}, {cx + 16*scale:.2f} {cy + 35*scale:.2f}, {cx + 38*scale:.2f} {cy + 44*scale:.2f}"
    )
    lower = (
        f"M {cx - 38*scale:.2f} {cy + 44*scale:.2f} "
        f"C {cx - 16*scale:.2f} {cy + 35*scale:.2f}, {cx - waist:.2f} {cy + 10*scale:.2f}, {cx:.2f} {cy:.2f} "
        f"C {cx + waist:.2f} {cy - 10*scale:.2f}, {cx + 16*scale:.2f} {cy - 35*scale:.2f}, {cx + 38*scale:.2f} {cy - 44*scale:.2f}"
    )
    return tag(
        "g",
        "\n".join(
            [
                path(upper, fill="none", stroke=color, **{"stroke-width": 3.6 * scale, "stroke-linecap": "round"}),
                path(lower, fill="none", stroke=color, **{"stroke-width": 3.6 * scale, "stroke-linecap": "round"}),
                circle(cx, cy, max(2.0, 4.5 * scale * neck), fill=COLORS["orange"], stroke=COLORS["red"], **{"stroke-width": 0.9 * scale}),
            ]
        ),
    )


def draw_bridge(cx: float, cy: float, scale: float, bridge: float) -> str:
    r = 28 * scale
    gap = 29 * scale - 13 * scale * bridge
    bridge_w = max(3 * scale, 10 * scale * bridge)
    return tag(
        "g",
        "\n".join(
            [
                circle(cx - gap, cy, r, fill="#EAF7FF", stroke=COLORS["teal"], **{"stroke-width": 2.2 * scale}),
                circle(cx + gap, cy, r, fill="#EAF7FF", stroke=COLORS["teal"], **{"stroke-width": 2.2 * scale}),
                rect(cx - bridge_w, cy - 5 * scale, 2 * bridge_w, 10 * scale, rx=5 * scale, fill=COLORS["orange"]),
            ]
        ),
    )


def draw_jet(cx: float, cy: float, scale: float, height: float) -> str:
    h = height * scale
    d = (
        f"M {cx - 36*scale:.2f} {cy + 32*scale:.2f} "
        f"C {cx - 10*scale:.2f} {cy + 12*scale:.2f}, {cx - 5*scale:.2f} {cy - 8*scale:.2f}, {cx:.2f} {cy - h:.2f} "
        f"C {cx + 5*scale:.2f} {cy - 8*scale:.2f}, {cx + 10*scale:.2f} {cy + 12*scale:.2f}, {cx + 36*scale:.2f} {cy + 32*scale:.2f}"
    )
    return tag(
        "g",
        "\n".join(
            [
                path(d, fill="#E0F2FE", stroke=COLORS["green"], **{"stroke-width": 2.4 * scale}),
                circle(cx, cy - h - 8 * scale, 4.5 * scale, fill=COLORS["red"]),
            ]
        ),
    )


def draw_beads(cx: float, cy: float, scale: float) -> str:
    parts = [line(cx - 46 * scale, cy, cx + 46 * scale, cy, stroke=COLORS["violet"], **{"stroke-width": 2.0 * scale})]
    for xoff, radius in [(-37, 11), (-18, 4), (0, 8), (20, 4), (38, 11)]:
        parts.append(circle(cx + xoff * scale, cy, radius * scale, fill="#F5E8FF", stroke=COLORS["violet"], **{"stroke-width": 1.7 * scale}))
    return tag("g", "\n".join(parts))


def frame(x: float, y: float, w: float, h: float, label: str, drawing: str) -> str:
    return tag(
        "g",
        "\n".join(
            [
                rect(x, y, w, h, fill="#FBFDFF", stroke="#9AAFC7", **{"stroke-width": 0.85}),
                line(x + w / 2, y + 6, x + w / 2, y + h - 6, stroke="#7C8796", **{"stroke-width": 0.65, "stroke-dasharray": "3 3"}),
                drawing,
                text_lines(label, x=x + w / 2, y=y + h - 8, width_chars=14, size=5.9, fill=COLORS["muted"], anchor="middle", weight=650),
            ]
        ),
    )


def time_sequence(x: float, y: float, w: float, h: float) -> str:
    n = 8
    gap = 2
    fw = (w - gap * (n - 1)) / n
    parts: list[str] = []
    for i in range(n):
        fx = x + i * (fw + gap)
        frac = i / (n - 1)
        if i < 3:
            drawing = draw_bridge(fx + fw / 2, y + h / 2 - 2, 0.82, 0.18 + frac * 1.8)
        elif i < 6:
            drawing = draw_pinchoff(fx + fw / 2, y + h / 2 - 1, 0.82, COLORS["blue"], neck=1.15 - 0.15 * i)
        else:
            drawing = draw_jet(fx + fw / 2, y + h / 2 + 18, 0.70, 42 + 8 * (i - 6))
        parts.append(frame(fx, y, fw, h, f"t/tc = {frac:.2f}", drawing))
    return tag("g", "\n".join(parts))


def schematic_panel(x: float, y: float, w: float, h: float) -> str:
    cx = x + w * 0.57
    cy = y + h * 0.53
    parts = [
        rect(x, y, w, h, fill="#B8DEF3"),
        rect(x, y + h - 22, w, 22, fill="#C8C0B8"),
        rect(x + w * 0.48, y + h - 34, w * 0.18, 34, fill="#1F2937"),
        circle(cx, cy - 14, 42, fill="#FFFFFF"),
        circle(cx, cy + 47, 11, fill="#FFFFFF"),
        line(cx, cy - 14, cx + 38, cy - 47, stroke=COLORS["ink"], **{"stroke-width": 1.8}),
        text_lines("surface tension", x=cx + 45, y=cy - 50, width_chars=18, size=7.2, weight=700),
        text_lines("gas", x=cx - 36, y=cy - 39, width_chars=12, size=7.2, weight=700),
        text_lines("liquid", x=x + 12, y=y + 30, width_chars=16, size=7.2, weight=700),
        text_lines("local radius", x=cx + 14, y=cy + 54, width_chars=17, size=6.4, fill=COLORS["muted"]),
        line(cx + 10, cy + 47, cx + 32, cy + 47, stroke=COLORS["ink"], **{"stroke-width": 1.1, "marker-end": "url(#arrow)"}),
    ]
    return tag("g", "\n".join(parts))


def regime_map(x: float, y: float, w: float, h: float) -> str:
    parts = [
        rect(x, y, w, h, fill="#EAF7FF", stroke="#9AAFC7", **{"stroke-width": 0.8}),
        rect(x, y, w, h * 0.38, fill="#FBCACA", opacity=0.8),
        text_lines("No breakup", x=x + w * 0.55, y=y + h * 0.22, width_chars=16, size=14, fill="#C02660", weight=900, anchor="middle"),
        text_lines("Breakup", x=x + w * 0.53, y=y + h * 0.78, width_chars=14, size=15, fill=COLORS["blue"], weight=900, anchor="middle"),
        line(x + 28, y + h - 24, x + w - 20, y + h - 24, stroke=COLORS["ink"], **{"stroke-width": 1.0, "marker-end": "url(#arrow)"}),
        line(x + 28, y + h - 24, x + 28, y + 22, stroke=COLORS["ink"], **{"stroke-width": 1.0, "marker-end": "url(#arrow)"}),
        text_lines("Oh", x=x + w - 20, y=y + h - 8, width_chars=8, size=7.4, anchor="end"),
        text_lines("De", x=x + 12, y=y + 22, width_chars=8, size=7.4),
    ]
    points = [(0.14, 0.78), (0.18, 0.65), (0.24, 0.55), (0.32, 0.44), (0.43, 0.38), (0.56, 0.35), (0.72, 0.34), (0.86, 0.34)]
    for px, py in points:
        parts.append(circle(x + px * w, y + py * h, 3.0, fill="#8B2F23", stroke=COLORS["ink"], **{"stroke-width": 0.5}))
    parts.append(path(f"M {x+0.12*w:.1f} {y+0.84*h:.1f} C {x+0.25*w:.1f} {y+0.47*h:.1f}, {x+0.43*w:.1f} {y+0.36*h:.1f}, {x+0.88*w:.1f} {y+0.33*h:.1f}", fill="none", stroke=COLORS["ink"], **{"stroke-width": 1.1, "stroke-dasharray": "4 4"}))
    return tag("g", "\n".join(parts))


def build_svg() -> str:
    parts: list[str] = []
    parts.append(rect(0, 0, A0_WIDTH_MM, A0_HEIGHT_MM, fill=COLORS["pale_blue"]))
    parts.append(rect(20, 20, 801, 1149, rx=21, fill=COLORS["paper"], stroke=COLORS["navy"], **{"stroke-width": 2.7}))

    parts.append(text_lines("HYDRODYNAMIC SINGULARITIES", x=420.5, y=75, width_chars=34, size=29, fill=COLORS["blue"], weight=950, anchor="middle"))
    parts.append(text_lines("Vatsal Sanjay", x=420.5, y=108, width_chars=24, size=14.5, weight=800, anchor="middle"))
    parts.append(text_lines("Physics of Fluids | CoMPhy Lab | Durham University", x=420.5, y=131, width_chars=62, size=10.3, fill=COLORS["muted"], weight=700, anchor="middle"))
    parts.append(line(45, 156, 796, 156, stroke=COLORS["navy"], **{"stroke-width": 1.2}))

    abstract = [
        text_lines(
            "Hydrodynamic singularities appear when a smooth free surface focuses motion into a neck, bridge, rim, or tip. The global flow may be millimetres wide, but the decisive balance can be set by a much smaller inner region.",
            x=54,
            y=232,
            width_chars=55,
            size=9.3,
            fill=COLORS["ink"],
        ),
        text_lines(
            "Poster content placeholder: replace with the final student-facing story once the figures are chosen.",
            x=54,
            y=307,
            width_chars=50,
            size=7.8,
            fill=COLORS["muted"],
            weight=700,
        ),
    ]
    parts.append(section_box(39, 178, 375, 164, "Abstract", abstract))

    highlights = [
        text_lines("Key questions", x=451, y=231, width_chars=22, size=10.0, fill=COLORS["ink"], weight=850),
        text_lines("- What local length scale is collapsing?", x=451, y=253, width_chars=44, size=8.4, fill=COLORS["ink"]),
        text_lines("- Which balance resolves the near-singular region?", x=451, y=274, width_chars=46, size=8.4, fill=COLORS["ink"]),
        text_lines("- How does a small neck or tip control the whole flow?", x=451, y=295, width_chars=44, size=8.4, fill=COLORS["ink"]),
        text_lines("Useful numbers: Oh, We, Ca, De, Wi", x=451, y=323, width_chars=44, size=8.4, fill=COLORS["blue"], weight=850),
    ]
    parts.append(section_box(427, 178, 375, 164, "Highlights", highlights))

    seq_content = [
        text_lines("One visual spine: coalescence, necking, jetting, and breakup", x=420.5, y=403, width_chars=76, size=10.4, fill=COLORS["ink"], weight=800, anchor="middle"),
        time_sequence(55, 424, 731, 148),
        text_lines("Use this central strip for real Basilisk or experimental frames later. Keep time labels and one colour field; do not bury the story in tiny subpanels.", x=70, y=595, width_chars=112, size=8.1, fill=COLORS["muted"]),
    ]
    parts.append(section_box(39, 355, 763, 263, "From smooth motion to a tiny decisive region", seq_content))

    mechanism_left = [
        text_lines("Pinch-off", x=62, y=694, width_chars=16, size=11.2, fill=COLORS["ink"], weight=900),
        draw_pinchoff(152, 761, 1.12, COLORS["blue"], neck=0.55),
        text_lines("The minimum radius becomes the natural clock. Competing balances decide the thinning route.", x=61, y=826, width_chars=42, size=7.5, fill=COLORS["muted"]),
        text_lines("Coalescence", x=246, y=694, width_chars=16, size=11.2, fill=COLORS["ink"], weight=900),
        draw_bridge(336, 761, 1.10, 0.95),
        text_lines("A microscopic bridge reshapes both drops, coupling local curvature to global motion.", x=245, y=826, width_chars=40, size=7.5, fill=COLORS["muted"]),
    ]
    parts.append(section_box(39, 640, 375, 255, "Local geometry", mechanism_left))

    mechanism_right = [
        text_lines("Jets and sheets", x=451, y=694, width_chars=22, size=11.2, fill=COLORS["ink"], weight=900),
        draw_jet(535, 784, 0.95, 55),
        path("M 600 772 C 625 740, 689 740, 720 772", fill="none", stroke=COLORS["orange"], **{"stroke-width": 5.0, "stroke-linecap": "round"}),
        text_lines("Rims, tips, ligaments, and droplets are different routes to the same question: where does the flow focus next?", x=451, y=826, width_chars=49, size=8.1, fill=COLORS["muted"]),
        draw_beads(716, 785, 0.78),
    ]
    parts.append(section_box(427, 640, 375, 255, "Pathways", mechanism_right))

    lower_left = [
        text_lines("Placeholder schematic", x=62, y=967, width_chars=26, size=9.2, fill=COLORS["ink"], weight=850),
        schematic_panel(60, 984, 154, 104),
        text_lines("Replace with the final mechanism drawing: neck radius, outer scale, stress balance, and the dimensionless groups that matter.", x=250, y=984, width_chars=34, size=7.7, fill=COLORS["muted"]),
    ]
    parts.append(section_box(39, 917, 375, 190, "What sets the cutoff?", lower_left))

    lower_right = [
        text_lines("Regime-map slot", x=451, y=967, width_chars=24, size=9.2, fill=COLORS["ink"], weight=850),
        regime_map(451, 984, 150, 104),
        text_lines("Use this for the final take-home message: which regime breaks, which regime survives, and what physics changes the route.", x=620, y=984, width_chars=34, size=7.7, fill=COLORS["muted"]),
    ]
    parts.append(section_box(427, 917, 375, 190, "Conclusion", lower_right))

    parts.append(line(45, 1121, 796, 1121, stroke=COLORS["navy"], **{"stroke-width": 1.1}))
    parts.append(text_lines("Physics of Fluids", x=145, y=1132, width_chars=22, size=6.5, fill=COLORS["muted"], anchor="middle", weight=700))
    parts.append(text_lines("CoMPhy Lab", x=420.5, y=1130, width_chars=20, size=7.2, fill=COLORS["muted"], anchor="middle", weight=800))
    parts.append(text_lines("Durham University", x=693, y=1132, width_chars=24, size=6.5, fill=COLORS["muted"], anchor="middle", weight=700))
    parts.append(image(LOGO_DIR / "physics-of-fluids.png", 90, 1135, 110, 45))
    parts.append(image(LOGO_DIR / "comphy-lab.png", 352.5, 1131, 136, 56))
    parts.append(image(LOGO_DIR / "durham-university.png", 625, 1139, 138, 43))

    defs = """
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M 0 0 L 8 4 L 0 8 z" fill="#111827"/>
    </marker>
    <style>
      text { dominant-baseline: alphabetic; }
    </style>
    """
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{A0_WIDTH_MM}mm" '
        f'height="{A0_HEIGHT_MM}mm" viewBox="0 0 {A0_WIDTH_MM} {A0_HEIGHT_MM}" version="1.1">\n'
        f"<defs>{defs}</defs>\n" + "\n".join(parts) + "\n</svg>\n"
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
    subprocess.run([converter, "-f", "png", "-w", str(preview_width), "-h", str(preview_height), "-o", str(png_path), str(svg_path)], check=True)
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
