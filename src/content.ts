/**
 * Hydrodynamic Singularities — poster content.
 *
 * A student-facing introduction for the Durham Physics Staff–Student Research
 * Poster Event, NOT a companion to a paper. The narrative arc:
 *
 *   1. Singularities are cool — a pinching free surface (drop, bubble) races to
 *      a point in finite time and turns self-similar, so it FORGETS how it
 *      began. Singularities erase a fluid's memory.  → the HERO: a drop
 *      pinch-off time series, then a bubble one.
 *   2. The twist (the LATER part) — elasticity is memory. A pinch of polymer
 *      hands the memory back... but only to the drop, not the dilute bubble.
 *   3. Why — it depends on what DRIVES the collapse, what RESISTS it, and the
 *      GEOMETRY of the neck.
 *
 * Inline HTML (src/types.ts): <strong> = coral, reserved for the ONE key noun
 * per block; <em> for softer emphasis; <b> = teal in captions. LaTeX goes in
 * $…$ (inline) or $$…$$ (display) and is rendered by KaTeX at build time.
 * `scaling`/`compare` raw-LaTeX fields render directly.
 *
 * Physics verified June 2026 (drop 2/3 clean; bubble ≈1/2 with a weak log
 * correction; stress σ_zz∼G(h₀/h)⁴ for the drop vs σ_rr∼G(h₀/h)² for the
 * bubble). Sources at the foot of the poster.
 */

import type { PosterContent } from "./types.js";

export const poster: PosterContent = {
  meta: {
    orientation: "portrait",
    eyebrow: "Physics Staff–Student Research Poster · Durham University · 12 June 2026",
    title: "Hydrodynamic singularities",
    subtitle:
      "When a drop or a bubble pinches off, the flow forgets its past. A pinch of polymer brings the memory back — but only for the drop.",
    authors: [{ name: "Vatsal Sanjay" }],
    affiliations: [
      { mark: "", text: "CoMPhy Lab, Department of Physics, Durham University" },
    ],
    collaborators:
      "With <b>Coen I. Verschuur</b>, <b>Alexandros T. Oratis</b> &amp; <b>Jacco H. Snoeijer</b> — Physics of Fluids, University of Twente",
  },

  labMark: { src: "assets/logos/comphy-mark.png", alt: "CoMPhy Lab" },

  hero: {
    lede:
      "A <strong>singularity</strong> is where a smooth flow runs out of room: a finite quantity racing to infinity in a finite time. As a drop or a bubble pinches off, the neck radius $h$ collapses to zero and the shape turns self-similar, $h \\sim (t_0-t)^{\\alpha}$ — a universal form fixed only by the local balance of inertia, surface tension and viscosity. The flow <strong>forgets how it began</strong>. Singularities erase a fluid's memory.",
    strips: [
      {
        label: "A <strong>drop</strong> pinches off",
        scaling: "h \\sim (t_0-t)^{2/3}",
        note: "Plain water. Surface tension pulls a slender axial thread to a point, then it snaps into satellite drops — milliseconds.",
        figure: {
          src: "assets/figures/hero_drop_pinchoff.png",
          alt: "Time series of a Newtonian water drop pinching off, from −4.55 ms to 0.6 ms",
        },
      },
      {
        label: "A <strong>bubble</strong> pinches off",
        scaling: "h \\sim (t_0-t)^{1/2}",
        note: "Plain water. The surrounding liquid's inertia collapses the cavity radially — microseconds, a thousand times faster.",
        figure: {
          src: "assets/figures/hero_bubble_pinchoff.png",
          alt: "Time series of a Newtonian bubble pinching off, from −20 µs to 7.5 µs",
        },
      },
    ],
    caption:
      "Two free surfaces, the same finite-time blow-up: read left to right, $t=0$ is the singularity. They reach it by different routes (a drop along a thread, a bubble by collapsing a cavity), so they carry different exponents. <b>What if we gave the fluid a memory?</b>",
  },

  blocks: [
    // ---------- LEAD BAND: the pivot to elasticity ----------
    {
      kind: "key",
      column: "full",
      place: "lead",
      heading: "Elasticity is memory",
      body: [
        "Dissolve a few polymer chains and the liquid gains a memory — each chain stores its own stretching history over a relaxation time. So elasticity should hand back the memory the singularity just erased. It does for a drop, yet a dilute bubble pinches off as if the polymer were not there. Why the difference?",
      ],
    },

    // ---------- LEFT COLUMN: the drop ----------
    {
      kind: "section",
      column: "left",
      heading: "The drop remembers",
      body: [
        "A water drop reaches a genuine finite-time singularity. The pinch is capillary-driven and the neck is a slender axial thread, so the polymers stretch <em>along</em> the axis as it closes.",
        "That alignment makes the elastic stress diverge strongly, $\\sigma_{zz} \\sim G\\,(h_0/h)^{4}$. It outruns the capillary pull, arrests the pinch and draws the neck into a long-lived <strong>beads-on-a-string</strong> filament — alive for hundreds of milliseconds even at a dilute $c=1/32$ wt%.",
      ],
      figure: {
        src: "assets/figures/drop_experiment_two_rows.png",
        alt: "Experimental drop pinch-off: a Newtonian water row and a dilute-polymer row",
        caption:
          "<b>Drop pinch-off.</b> Top: plain water reaches the singularity and snaps into satellites. Bottom: the same dilute polymer draws the neck into a persistent beads-on-a-string thread.",
      },
      outcome: { text: "Dilute polymer → a thread. Memory wins.", tone: "coral" },
    },

    // ---------- RIGHT COLUMN: the bubble ----------
    {
      kind: "section",
      column: "right",
      heading: "The bubble forgets anyway",
      body: [
        "A bubble neck pinches just as sharply, $h \\sim (t_0-t)^{1/2}$, but the collapse is inertia-driven and the cavity closes <em>radially</em>, so the polymers stretch sideways rather than along a thread.",
        "Stretched the wrong way the elastic stress diverges only weakly, $\\sigma_{rr} \\sim G\\,(h_0/h)^{2}$, and stays subdominant to the liquid's inertia. A dilute solution cannot organise a filament; the pinch-off stays water-like. A thread needs <strong>high concentration</strong>, and even then its fate hangs on the needle size.",
      ],
      figure: {
        src: "assets/figures/bubble_experiment_two_rows.png",
        alt: "Experimental bubble pinch-off: a Newtonian water row and a dilute-polymer row",
        caption:
          "<b>Bubble pinch-off.</b> Top: water. Bottom: the same dilute polymer. In the dilute limit the two near-singular sequences are almost indistinguishable.",
      },
      outcome: { text: "Dilute polymer → no thread. The singularity survives.", tone: "teal" },
    },

    // ---------- TAIL BAND: why the split (driving / resisting / geometry) ----------
    {
      kind: "compare",
      column: "full",
      heading: "Why elasticity picks sides",
      columns: ["Drop", "Bubble"],
      rows: [
        {
          label: "What drives the pinch",
          a: "surface tension (capillary)",
          b: "the outer liquid's inertia",
        },
        {
          label: "Neck geometry",
          a: "a slender <strong>axial</strong> thread — polymers stretch along it",
          b: "a <strong>radial</strong> cavity — polymers stretch sideways",
        },
        {
          label: "Elastic stress",
          a: "$\\sigma_{zz}\\sim G(h_0/h)^{4}$ — strong",
          b: "$\\sigma_{rr}\\sim G(h_0/h)^{2}$ — weak",
        },
        {
          label: "Does memory win?",
          a: "yes — it overtakes the drive and grows a thread",
          b: "no — it stays subdominant; no thread forms",
        },
      ],
      note: "Two extra powers of $(h_0/h)$ is the whole story: along a drop's thread the elastic stress overtakes the drive, while across a bubble's cavity it stays a bystander (the elastocapillary number $\\mathrm{Ec}=G h_0/\\gamma$ sets the balance). Reading which singularities a pinch of elasticity can rewrite is how we learn to control breakup — threads, sprays and aerosols.",
    },

    // ---------- ENDMATTER ----------
    {
      kind: "references",
      column: "full",
      heading: "References",
      items: [
        "<b>Verschuur, C. I., Oratis, A. T., Sanjay, V. &amp; Snoeijer, J. H.</b> How elasticity affects bubble pinch-off. <i>arXiv</i>:2511.20075 (2026). <i>This work.</i>",
        "<b>Eggers, J.</b> Nonlinear dynamics and breakup of free-surface flows. <i>Rev. Mod. Phys.</i> <b>69</b>, 865 (1997).",
        "<b>Day, R. F., Hinch, E. J. &amp; Lister, J. R.</b> Self-similar capillary pinchoff of an inviscid fluid. <i>Phys. Rev. Lett.</i> <b>80</b>, 704 (1998).",
        "<b>Burton, J. C., Waldrep, R. &amp; Taborek, P.</b> Scaling and instabilities in bubble pinch-off. <i>Phys. Rev. Lett.</i> <b>94</b>, 184502 (2005).",
        "<b>Clasen, C.</b> et al. The beads-on-string structure of viscoelastic threads. <i>J. Fluid Mech.</i> <b>556</b>, 283 (2006).",
        "<b>Eggers, J., Herrada, M. A. &amp; Snoeijer, J. H.</b> Self-similar breakup of polymeric threads (Oldroyd-B). <i>J. Fluid Mech.</i> <b>887</b>, A19 (2020).",
      ],
    },
    {
      kind: "acknowledgements",
      column: "full",
      heading: "Acknowledgements",
      body: "Simulations with <b>Basilisk C</b> (Popinet, <i>J. Comput. Phys.</i> <b>228</b>, 5838, 2009) on Durham's <b>Hamilton</b> HPC. A CoMPhy Lab (Durham) × Physics of Fluids (Twente) collaboration.",
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
