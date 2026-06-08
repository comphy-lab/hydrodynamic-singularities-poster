# Hydrodynamic Singularities — A0 poster on the CoMPhy Lab design system.
# The poster is HTML/CSS (src/ + design-system/); these targets drive the render.

.PHONY: all poster html pdf png landscape logos figures setup typecheck clean

# Full pipeline: QR -> standalone HTML -> true-A0 PDF + PNG preview.
all poster:
	python3 scripts/make_poster.py

# Rebuild only the standalone HTML from src/content.ts (no render).
html:
	python3 scripts/make_poster.py --html-only

# Render from the existing/committed HTML without rebuilding (no Node needed).
pdf:
	python3 scripts/make_poster.py --no-build --no-png

png:
	python3 scripts/make_poster.py --no-build --no-pdf

# Landscape A0 variant.
landscape:
	python3 scripts/make_poster.py --orientation landscape

# Regenerate the vector logos used by the build from their PDF masters.
# assets/logos/<name>.pdf is the source of truth; <name>.svg is what the build
# inlines (Chrome renders SVG as true vector with transparency, unlike a PDF in
# an <img>). The committed SVGs make the default build self-contained, so this
# is only needed after a logo master changes. Requires pdftocairo (poppler).
logos:
	@command -v pdftocairo >/dev/null 2>&1 || { echo "pdftocairo (poppler) not found; install it to regenerate logo SVGs."; exit 1; }
	@svgo=$$(test -x node_modules/.bin/svgo && echo node_modules/.bin/svgo || command -v svgo || true); \
	for pdf in assets/logos/*.pdf; do \
		svg=$${pdf%.pdf}.svg; \
		pdftocairo -svg "$$pdf" "$$svg"; \
		[ -n "$$svgo" ] && "$$svgo" -q -p 2 --multipass "$$svg" -o "$$svg"; \
		echo "logos: $$pdf -> $$svg"; \
	done; \
	[ -n "$$svgo" ] || echo "logos: svgo not found (run 'make setup'); SVGs left unoptimised (larger files)."

# Regenerate the experiment figures from their PDF masters. Unlike the logos,
# these PDFs are raster composites (microscopy filmstrips), so the build uses
# high-DPI *transparent* PNGs, not SVG — SVG would only re-wrap the same pixels.
# 220 dpi ≈ 275 effective DPI at the ~80 mm A0 display size; -transp keeps the
# canvas/label transparency so the warm paper shows through. Requires pdftocairo
# (poppler). The PDF masters are large (~54 MB); if they're not in the working
# tree this target skips gracefully and the committed PNGs are used as-is.
figures:
	@command -v pdftocairo >/dev/null 2>&1 || { echo "pdftocairo (poppler) not found; install it to regenerate figure PNGs."; exit 1; }
	@for pdf in assets/figures/*_experiment_two_rows.pdf; do \
		[ -e "$$pdf" ] || { echo "figures: no PDF masters in the tree; using committed PNGs."; break; }; \
		stem=$${pdf%.pdf}; \
		pdftocairo -png -transp -r 220 -singlefile "$$pdf" "$$stem"; \
		echo "figures: $$pdf -> $$stem.png"; \
	done

# One-off: install the TypeScript toolchain (tsx + typescript).
setup:
	npm install

# Type-check the content + renderer.
typecheck:
	npx tsc --noEmit

clean:
	rm -f outputs/poster.html \
	      outputs/hydrodynamic_singularities_poster.pdf \
	      outputs/hydrodynamic_singularities_poster.png
