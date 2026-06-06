/**
 * Hydrodynamic Singularities — poster content.
 *
 * This is the one file to edit for wording, figures and references.
 * The science: a singularity is where a smooth free-surface flow blows up and
 * forgets its past; near it the dynamics are universal and self-similar. The
 * canonical contrast is drop pinch-off (polymers arrest the singularity into
 * beads-on-a-string) versus bubble pinch-off (polymers leave it intact).
 *
 * Layout: two parallel columns (concept | scaling, then drop | bubble), a
 * full-width synthesis band, and a full-width references/acknowledgements band.
 *
 * Inline HTML (see src/types.ts): <strong> = coral and is reserved for the ONE
 * key noun per block; use <em> for softer emphasis, <code> for symbols.
 */

import type { PosterContent } from "./types.js";

export const poster: PosterContent = {
  meta: {
    orientation: "portrait",
    eyebrow: "Physics Staff–Student Research Poster · Durham University · 12 June 2026",
    title: "Hydrodynamic singularities",
    subtitle:
      "When a free surface pinches off, the flow forgets its past — and a drop and a bubble meet the singularity on opposite terms.",
    authors: [{ name: "Vatsal Sanjay", marks: ["1"] }],
    affiliations: [
      {
        mark: "1",
        text: "Computational Multiphase Physics (CoMPhy) Lab, Department of Physics, Durham University",
      },
    ],
  },

  labMark: { src: "assets/logos/comphy-mark.png", alt: "CoMPhy Lab" },

  hero: {
    figure: {
      src: "assets/figures/numerical_snapshots.png",
      alt: "Numerical pinch-off sequences: bubble and drop, Newtonian and viscoelastic",
      caption:
        "Direct numerical simulation (<b>Basilisk C</b>). Top — a <b>bubble</b> neck pinches off; Newtonian (left) and viscoelastic (right) both reach the singular point. Bottom — a <b>drop</b> neck; Newtonian (left) pinches, but the same polymer (right) draws it into a long, persistent thread.",
    },
    lede:
      "A <strong>singularity</strong> is where a smooth flow blows up — a finite quantity racing to infinity in a finite time. As a free surface pinches, the neck radius collapses to zero and the dynamics turn <em>universal and self-similar</em>: the flow forgets how it began. Add a pinch of polymer and the two textbook cases part ways.",
    plots: {
      src: "assets/figures/hero_scaling.png",
      alt: "Neck radius h(t) for a drop and a bubble, with log-log insets showing the 1/2 self-similar scaling",
      caption:
        "Neck radius <code>h(t)</code> for each case; the log–log insets show the self-similar <code>1/2</code> scaling near pinch-off. <i>Axes shown — data to follow.</i>",
      blend: false,
    },
  },

  blocks: [
    // ---------- LEFT COLUMN: concept → drops ----------
    {
      kind: "section",
      column: "left",
      heading: "What is a singularity?",
      chips: [
        { text: "free-surface flow" },
        { text: "pinch-off" },
        { text: "self-similarity" },
        { text: "DNS · Basilisk", tone: "teal" },
      ],
      body: [
        "Pinch-off, coalescence, the snap of a sheet or jet — soft-matter flows routinely concentrate geometry, stress and time into a single point. There the neck radius, the curvature and the local strain rate diverge together, and the smooth continuum picture is pushed to its limit.",
        "Close to that point the flow loses memory of how it began. Whatever the nozzle, the liquid or the forcing, the final approach collapses onto the <strong>same self-similar shape</strong>.",
      ],
    },
    {
      kind: "section",
      column: "left",
      heading: "Drops: elasticity changes the route",
      body: [
        "A Newtonian drop pinches in finite time: the neck thins to a point and the drop detaches — a clean finite-time singularity.",
        "<em>Add polymers</em> and the route changes. As the neck thins, stretching chains build elastic stress along the thread and arrest the collapse. The neck survives as a slender filament that beads up into the classic <strong>beads-on-a-string</strong> — the singularity is postponed, then averted.",
      ],
      figure: {
        src: "assets/figures/drop_experiment_two_rows.png",
        alt: "Experimental drop pinch-off: Newtonian row and elastic row",
        caption:
          "<b>Drop pinch-off.</b> Top: a Newtonian neck thins to a true finite-time singularity. Bottom: a dilute polymer turns the neck into a persistent beads-on-a-string filament.",
      },
      outcome: { text: "Polymers kill the drop singularity", tone: "coral" },
    },

    // ---------- RIGHT COLUMN: scaling → bubbles ----------
    {
      kind: "scaling",
      column: "right",
      heading: "The self-similar fingerprint",
      formula: "h<sub>min</sub>(t) &nbsp;∼&nbsp; (t<sub>0</sub> − t)<sup>α</sup>",
      note: "The minimum neck radius vanishes as a power law in the time-to-pinch <code>t<sub>0</sub> − t</code>. Rescale every interface by the local neck radius and the shapes collapse onto a single master curve.",
    },
    {
      kind: "section",
      column: "right",
      heading: "Bubbles: elasticity leaves the singularity intact",
      body: [
        "A collapsing bubble neck pinches just as sharply, but the stretching now happens in the liquid <em>outside</em> the neck — where the polymer has little chance to organise against the flow.",
        "Add the same polymers and the near-singular sequence looks almost unchanged: the bubble keeps its Newtonian-like approach to the <strong>singular point</strong>.",
      ],
      figure: {
        src: "assets/figures/bubble_experiment_two_rows.png",
        alt: "Experimental bubble pinch-off: Newtonian row and viscoelastic row",
        caption:
          "<b>Bubble pinch-off.</b> Top: Newtonian. Bottom: viscoelastic. The two near-singular sequences are almost indistinguishable.",
      },
      outcome: { text: "Polymers spare the bubble singularity", tone: "teal" },
    },

    // ---------- FULL-WIDTH: synthesis ----------
    {
      kind: "key",
      column: "full",
      heading: "What it tells us",
      items: [
        "Two free surfaces, one polymer additive, <strong>opposite outcomes</strong>: elasticity arrests the drop singularity but barely touches the bubble's.",
        "The deciding factor is <em>where</em> the fluid is stretched — inside the thinning thread for a drop, outside the collapsing neck for a bubble.",
        "Singularities are where flows turn <strong>universal</strong>. Knowing which ones elasticity can tame is knowing how to control breakup, sprays and the size of the drops that fly off.",
      ],
    },

    // ---------- FULL-WIDTH: endmatter (references | acknowledgements) ----------
    {
      kind: "references",
      column: "full",
      heading: "References",
      items: [
        "<b>Eggers, J.</b> Nonlinear dynamics and breakup of free-surface flows. <i>Rev. Mod. Phys.</i> <b>69</b>, 865 (1997).",
        "<b>Day, R. F., Hinch, E. J. &amp; Lister, J. R.</b> Self-similar capillary pinchoff of an inviscid fluid. <i>Phys. Rev. Lett.</i> <b>80</b>, 704 (1998).",
        "<b>Clasen, C.</b> et al. The beads-on-string structure of viscoelastic threads. <i>J. Fluid Mech.</i> <b>556</b>, 283 (2006).",
        "<b>Popinet, S.</b> Basilisk: adaptive solvers for multiphase flow. <code>basilisk.fr</code> (2013–).",
      ],
    },
    {
      kind: "acknowledgements",
      column: "full",
      heading: "Acknowledgements",
      body: "Computations with <b>Basilisk C</b> on Durham's <b>Hamilton</b> HPC. Part of the CoMPhy Lab programme on soft-matter singularities.",
    },
  ],

  footer: {
    qr: {
      url: "https://comphy-lab.org",
      title: "Find the lab",
      lines: ["Papers, code & simulations", "comphy-lab.org"],
      img: "assets/figures/qr.png",
    },
    contact: [
      "<b>Vatsal Sanjay</b> · CoMPhy Lab, Department of Physics, Durham University",
      "<span class=\"mono\">vatsal.sanjay@comphy-lab.org</span>",
    ],
    partners: [
      { src: "assets/logos/durham-university.png", alt: "Durham University", treatment: "multiply" },
      { src: "assets/logos/physics-of-fluids.png", alt: "Physics of Fluids", treatment: "invert" },
      { src: "assets/logos/basilisk.png", alt: "Basilisk", treatment: "normal" },
    ],
  },
};

export default poster;
