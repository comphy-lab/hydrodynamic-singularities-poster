.PHONY: all clean

all:
	python3 scripts/make_a0_poster.py

clean:
	rm -f outputs/hydrodynamic_singularities_poster.svg
	rm -f outputs/hydrodynamic_singularities_poster.pdf
	rm -f outputs/hydrodynamic_singularities_poster.png
