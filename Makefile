# Hydrodynamic Singularities — A0 poster on the CoMPhy Lab design system.
# The poster is HTML/CSS (src/ + design-system/); these targets drive the render.

.PHONY: all poster html pdf png landscape setup typecheck clean

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
