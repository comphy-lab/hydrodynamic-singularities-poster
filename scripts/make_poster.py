#!/usr/bin/env python3
"""Driver for the Hydrodynamic Singularities A0 poster.

The poster itself is HTML/CSS on the CoMPhy Lab design system (see
``design-system/`` and ``src/``). This script is the *driver*: it turns that
source into print-ready artifacts.

Pipeline
--------
1. (optional) generate a QR code to the lab site            -> assets/figures/qr.png
2. build the standalone poster HTML via the TS build        -> outputs/poster.html
3. render true-A0 PDF with headless Chrome (``@page`` size)  -> outputs/<stem>.pdf
4. rasterise a preview PNG (pdftoppm, else Chrome, else sips)-> outputs/<stem>.png

Every stage is skippable, and step 3/4 fall back to the committed
``outputs/poster.html`` if Node/TS isn't available — so the print deliverable is
always reachable.

Usage
-----
    python3 scripts/make_poster.py                 # full pipeline, portrait A0
    python3 scripts/make_poster.py --orientation landscape
    python3 scripts/make_poster.py --no-pdf        # HTML + PNG only
    python3 scripts/make_poster.py --html-only     # just (re)build the HTML
    python3 scripts/make_poster.py --no-build      # render the existing HTML
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "outputs"
HTML = OUTPUT_DIR / "poster.html"
STEM = "hydrodynamic_singularities_poster"
QR_TARGET = "https://comphy-lab.org"
QR_PATH = ROOT / "assets" / "figures" / "qr.png"

A0_PORTRAIT_PT = (2383.94, 3370.39)  # 841 x 1189 mm in points

# macOS / Linux candidates for a Chromium-family binary.
CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "microsoft-edge",
]


def log(msg: str) -> None:
    print(f"[poster] {msg}", flush=True)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--orientation", choices=["portrait", "landscape"], default="portrait")
    p.add_argument("--output-dir", type=Path, default=OUTPUT_DIR)
    p.add_argument("--png-dpi", type=int, default=92, help="raster DPI for the preview PNG")
    p.add_argument("--no-build", action="store_true", help="skip the TS build; render existing HTML")
    p.add_argument("--no-pdf", action="store_true", help="skip the PDF render")
    p.add_argument("--no-png", action="store_true", help="skip the PNG preview")
    p.add_argument("--no-qr", action="store_true", help="don't (re)generate the QR code")
    p.add_argument("--html-only", action="store_true", help="only build the HTML, no rendering")
    p.add_argument("--open", action="store_true", help="open the HTML in the default browser when done")
    return p.parse_args()


# --------------------------------------------------------------------------- #
# step 1 — QR code                                                            #
# --------------------------------------------------------------------------- #
_QR_SNIPPET = (
    "import qrcode\n"
    "from qrcode.constants import ERROR_CORRECT_M\n"
    "qr = qrcode.QRCode(error_correction=ERROR_CORRECT_M, box_size=22, border=2)\n"
    f"qr.add_data({QR_TARGET!r})\n"
    "qr.make(fit=True)\n"
    f"qr.make_image(fill_color='#0f0c08', back_color='#fffdf9').save({str(QR_PATH)!r})\n"
)


def generate_qr() -> None:
    """Render a tidy QR to the lab site.

    Tries the current interpreter, then an isolated ``uv`` env (no global
    install needed), then keeps any committed QR, then falls back to the
    finder-pattern placeholder baked into poster.css.
    """
    QR_PATH.parent.mkdir(parents=True, exist_ok=True)
    try:
        import qrcode
        from qrcode.constants import ERROR_CORRECT_M
        qr = qrcode.QRCode(error_correction=ERROR_CORRECT_M, box_size=22, border=2)
        qr.add_data(QR_TARGET)
        qr.make(fit=True)
        qr.make_image(fill_color="#0f0c08", back_color="#fffdf9").save(QR_PATH)
        log(f"QR -> {QR_PATH.relative_to(ROOT)}  ({QR_TARGET})")
        return
    except ModuleNotFoundError:
        pass
    if shutil.which("uv"):
        try:
            subprocess.run(["uv", "run", "--quiet", "--with", "qrcode[pil]", "python", "-c", _QR_SNIPPET],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if QR_PATH.exists():
                log(f"QR -> {QR_PATH.relative_to(ROOT)}  (via uv · {QR_TARGET})")
                return
        except subprocess.CalledProcessError:
            pass
    if QR_PATH.exists():
        log("Using the committed assets/figures/qr.png (install qrcode[pil] or uv to regenerate).")
    else:
        log("qrcode & uv unavailable — using the finder-pattern placeholder.")


# --------------------------------------------------------------------------- #
# step 2 — build HTML via the TS build                                        #
# --------------------------------------------------------------------------- #
def tsx_command() -> list[str] | None:
    local = ROOT / "node_modules" / ".bin" / "tsx"
    if local.exists():
        return [str(local)]
    if shutil.which("npx"):
        return ["npx", "--yes", "tsx"]
    return None


def build_html(orientation: str) -> bool:
    cmd = tsx_command()
    if cmd is None:
        log("Node/tsx not found — skipping build, will render the committed HTML.")
        return False
    full = [*cmd, "src/build.ts", "--orientation", orientation]
    log("build: " + " ".join(full))
    try:
        subprocess.run(full, cwd=ROOT, check=True)
    except subprocess.CalledProcessError as exc:
        log(f"TS build failed (exit {exc.returncode}); falling back to existing HTML.")
        return False
    return True


# --------------------------------------------------------------------------- #
# step 3/4 — render with headless Chrome                                      #
# --------------------------------------------------------------------------- #
def find_chrome() -> str | None:
    for cand in CHROME_CANDIDATES:
        if os.path.sep in cand:
            if Path(cand).exists():
                return cand
        elif shutil.which(cand):
            return shutil.which(cand)
    return None


def chrome_run(chrome: str, extra: list[str]) -> bool:
    """Run Chrome headless with a throwaway profile so it never touches the
    user's real Chrome session."""
    with tempfile.TemporaryDirectory(prefix="poster-chrome-") as profile:
        cmd = [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-color-profile=srgb",
            f"--user-data-dir={profile}",
            "--no-first-run",
            "--no-default-browser-check",
            "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=12000",
            *extra,
        ]
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30)
            return True
        except subprocess.TimeoutExpired:
            # Headless Chrome reliably writes the artifact but sometimes fails to
            # exit; the timeout kills it. The caller verifies the file exists.
            log("Chrome render took >30s and was stopped (artifact usually already written); continuing.")
            return True
        except subprocess.CalledProcessError as exc:
            log(f"Chrome failed (exit {exc.returncode}).")
            return False


def pdf_page_size(pdf: Path) -> tuple[float, float] | None:
    """Best-effort MediaBox read (points), so we can confirm true A0."""
    try:
        blob = pdf.read_bytes()
        marker = b"/MediaBox"
        idx = blob.find(marker)
        if idx < 0:
            return None
        seg = blob[idx + len(marker): idx + len(marker) + 64]
        open_b, close_b = seg.find(b"["), seg.find(b"]")
        if open_b < 0 or close_b < 0:
            return None
        nums = [float(x) for x in seg[open_b + 1: close_b].split()]
        if len(nums) == 4:
            return (round(nums[2] - nums[0], 1), round(nums[3] - nums[1], 1))
    except Exception:
        return None
    return None


def render_pdf(chrome: str, html: Path, out_dir: Path, orientation: str) -> Path | None:
    pdf = out_dir / f"{STEM}.pdf"
    ok = chrome_run(chrome, ["--no-pdf-header-footer", f"--print-to-pdf={pdf}", html.as_uri()])
    if not ok or not pdf.exists():
        return None
    size = pdf_page_size(pdf)
    expected = A0_PORTRAIT_PT if orientation == "portrait" else A0_PORTRAIT_PT[::-1]
    if size:
        ok_a0 = all(abs(a - b) < 5 for a, b in zip(size, expected))
        flag = "true A0" if ok_a0 else f"NOT A0 (expected {expected[0]:.0f}x{expected[1]:.0f}pt)"
        log(f"PDF -> {pdf.relative_to(ROOT)}  [{size[0]:.0f}x{size[1]:.0f}pt · {flag}]")
    else:
        log(f"PDF -> {pdf.relative_to(ROOT)}")
    return pdf


def render_png(chrome: str, html: Path, pdf: Path | None, out_dir: Path, dpi: int, orientation: str) -> Path | None:
    png = out_dir / f"{STEM}.png"
    # Preferred: rasterise the vector PDF (crisp, exact poster, no letterbox).
    pdftoppm = shutil.which("pdftoppm")
    if pdf and pdf.exists() and pdftoppm:
        try:
            subprocess.run([pdftoppm, "-png", "-r", str(dpi), "-singlefile", str(pdf), str(out_dir / STEM)],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if png.exists():
                log(f"PNG -> {png.relative_to(ROOT)}  [pdftoppm @ {dpi}dpi]")
                return png
        except subprocess.CalledProcessError:
            pass
    # Fallback: screenshot the HTML at the A0 aspect ratio, 2x for crispness.
    short, long = 1190, 1683
    w, h = (short, long) if orientation == "portrait" else (long, short)
    if chrome_run(chrome, [f"--screenshot={png}", f"--window-size={w},{h}", "--force-device-scale-factor=2", html.as_uri()]):
        if png.exists():
            log(f"PNG -> {png.relative_to(ROOT)}  [chrome screenshot {w*2}x{h*2}]")
            return png
    # Last resort: macOS sips.
    sips = shutil.which("sips")
    if pdf and pdf.exists() and sips:
        try:
            subprocess.run([sips, "-s", "format", "png", str(pdf), "--out", str(png)],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            if png.exists():
                log(f"PNG -> {png.relative_to(ROOT)}  [sips]")
                return png
        except subprocess.CalledProcessError:
            pass
    log("PNG preview could not be produced.")
    return None


def main() -> int:
    args = parse_args()
    out_dir: Path = args.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    if not args.no_qr:
        generate_qr()

    if not args.no_build:
        build_html(args.orientation)

    html = out_dir / "poster.html" if out_dir != OUTPUT_DIR else HTML
    if not html.exists():
        log(f"ERROR: {html} does not exist and could not be built. "
            "Install Node deps (`npm install`) or commit a built poster.html.")
        return 1
    log(f"HTML  -> {html.relative_to(ROOT)}")

    if args.html_only:
        if args.open:
            subprocess.run(["open", str(html)], check=False)
        return 0

    chrome = find_chrome()
    if chrome is None and not (args.no_pdf and args.no_png):
        log("No Chrome/Chromium found. Open outputs/poster.html and use the in-page "
            "'Print / Save PDF · A0' button, or install Google Chrome.")
        return 1

    pdf: Path | None = None
    if not args.no_pdf:
        pdf = render_pdf(chrome, html, out_dir, args.orientation)
    if not args.no_png:
        render_png(chrome, html, pdf, out_dir, args.png_dpi, args.orientation)

    if args.open:
        subprocess.run(["open", str(html)], check=False)
    log("done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
