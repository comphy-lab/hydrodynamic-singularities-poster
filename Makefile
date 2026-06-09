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

# Regenerate the science figures from their PDF masters. Each PDF is classified
# automatically: a raster composite (the microscopy experiment filmstrips) ->
# high-DPI *transparent* PNG (220 dpi ≈ 275 eff-DPI at A0; SVG would only re-wrap
# the same pixels); a pure-vector figure (hero filmstrips, elastic-drop, polymer
# schematic) -> optimised SVG, crisp at any size. Requires pdftocairo + pdfimages
# (poppler); svgo (via `make setup`) shrinks the vector output. Skips gracefully
# when a master isn't in the tree, leaving the committed asset as-is.
figures:
	@command -v pdftocairo >/dev/null 2>&1 || { echo "pdftocairo (poppler) not found."; exit 1; }
	@svgo=$$(test -x node_modules/.bin/svgo && echo node_modules/.bin/svgo || command -v svgo || true); \
	for pdf in assets/figures/*.pdf; do \
		[ -e "$$pdf" ] || { echo "figures: no PDF masters in the tree; using committed assets."; break; }; \
		stem=$${pdf%.pdf}; \
		if pdfimages -list "$$pdf" 2>/dev/null | tail -n +3 | grep -q 'image'; then \
			pdftocairo -png -transp -r 220 -singlefile "$$pdf" "$$stem"; \
			echo "figures: $$pdf -> $$stem.png (raster)"; \
		else \
			pdftocairo -svg "$$pdf" "$$stem.svg"; \
			[ -n "$$svgo" ] && "$$svgo" -q -p 2 --multipass "$$stem.svg" -o "$$stem.svg"; \
			echo "figures: $$pdf -> $$stem.svg (vector)"; \
		fi; \
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
