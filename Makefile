# Hydrodynamic Singularities — A0 poster on the CoMPhy Lab design system.
# The poster is HTML/CSS (src/ + design-system/); these targets drive the render.

.PHONY: all poster html pdf png landscape logos setup typecheck clean

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
