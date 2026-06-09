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
      "With <b>Coen I. Verschuur</b>, <b>Alexandros T. Oratis</b> &amp; <b>Jacco H. Snoeijer</b><br />Physics of Fluids, University of Twente",
  },

  labMark: { src: "assets/logos/comphy-mark.svg", alt: "CoMPhy Lab" },

  paperQr: {
    url: "https://arxiv.org/abs/2511.20075",
    title: "Read more",
    lines: [
      "Verschuur, C. I., Oratis, A. T., Sanjay, V. &amp; Snoeijer, J. H. How elasticity affects bubble pinch-off.",
      "arXiv:2511.20075 (2025)",
    ],
    img: "assets/figures/qr-arxiv.svg",
  },

  hero: {
    lede:
      "A <strong>singularity</strong> is when a smooth physical process blows up — something finite becomes infinite in a finite time or at a finite place. As a drop or a bubble pinches off, the neck radius $h$ races to zero and the shape turns self-similar, $h \\sim (t_0-t)^{\\alpha}$: a universal form set only by the local balance of inertia, surface tension and viscosity. The flow <strong>forgets how it began</strong>. Singularities erase a fluid's memory.",
    strips: [
      {
        label: "A <strong>drop</strong> pinches off",
        scaling: "h \\sim (t_0-t)^{2/3}",
        note: "Plain water. Surface tension pulls a slender axial thread to a point, then it snaps into satellite drops — milliseconds.",
        figure: {
          src: "assets/figures/hero_drop_pinchoff.svg",
          alt: "Time series of a Newtonian water drop pinching off, from −4.55 ms to 0.6 ms",
        },
      },
      {
        label: "A <strong>bubble</strong> pinches off",
        scaling: "h \\sim (t_0-t)^{1/2}",
        note: "Plain water. The surrounding liquid's inertia collapses the cavity radially — microseconds, a thousand times faster.",
        figure: {
          src: "assets/figures/hero_bubble_pinchoff.svg",
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
        "Dissolve a few polymer chains and the liquid gains a memory — each chain stores its stretching history over a relaxation time $\\lambda$. Push to the perfectly elastic limit ($\\lambda \\to \\infty$, nothing is forgotten) and ask whether memory can outlast the singularity. It does for a drop, yet a dilute bubble pinches off as if the polymer were not there. Why the difference?",
      ],
    },

    // ---------- LEFT COLUMN: the drop ----------
    {
      kind: "section",
      column: "left",
      grow: true,
      heading: "The drop remembers",
      body: [
        "A water drop reaches a finite-time singularity, $h \\sim (t_0-t)^{2/3}$. The pinch is capillary-driven, so the neck thins into a slender axial thread and the polymers stretch <em>along</em> it as it closes.",
        "The elastic stress then diverges as $\\sigma_{zz} \\sim G\\,(h_0/h)^{4}$ — faster than the capillary drive $\\gamma\\kappa \\sim \\gamma/h$ it fights. It must win: the collapse is arrested into a long-lived <strong>beads-on-a-string</strong> thread, and in the perfectly elastic limit the singularity is removed altogether.",
      ],
      figure: {
        src: "assets/figures/drop_experiment_two_rows.png",
        alt: "Experimental drop pinch-off: a Newtonian water row and a dilute-polymer row",
        fill: true,
        caption:
          "<b>Drop pinch-off.</b> Top: plain water reaches the singularity and snaps into satellites. Bottom: the same dilute polymer draws the neck into a persistent beads-on-a-string thread.",
      },
      outcome: { text: "Dilute polymer → a thread. Memory wins.", tone: "coral" },
    },

    // ---------- RIGHT COLUMN: the bubble ----------
    {
      kind: "section",
      column: "right",
      grow: true,
      heading: "The bubble forgets anyway",
      body: [
        "A bubble neck pinches just as sharply, $h \\sim (t_0-t)^{1/2}$, but the collapse is driven by the liquid's inertia and the cavity closes <em>radially</em>, so the polymers stretch sideways rather than along a thread.",
        "Now the elastic stress diverges only as $\\sigma_{rr} \\sim G\\,(h_0/h)^{2}$ — the <em>same</em> rate as the inertial drive $\\sigma_I \\sim \\rho\\dot h^{2}$. A fair race it cannot win: it stays subdominant, so the bubble reaches its singularity <strong>with or without memory</strong>.",
      ],
      figure: {
        src: "assets/figures/bubble_experiment_two_rows.png",
        alt: "Experimental bubble pinch-off: a Newtonian water row and a dilute-polymer row",
        fill: true,
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
      figure: {
        src: "assets/figures/pinchoff_schematic.svg",
        alt: "Schematic of drop and bubble pinch-off with polymer chains: relaxed coils in the bulk, stretched red chains at the neck",
        caption:
          "Polymers (blue coils) stretch where the neck thins (red): <b>along</b> the drop's axial thread, but only <b>sideways</b> across the bubble's neck.",
      },
      figureA: {
        src: "assets/figures/drop_pinchoff-elastic.svg",
        alt: "Elastic drop pinch-off: the neck is drawn into a persistent beads-on-a-string thread",
      },
      figureB: {
        src: "assets/figures/bubble_pinchoff-elastic.svg",
        alt: "Elastic bubble pinch-off: the cavity still collapses to a point despite the polymer",
      },
      columns: ["Drop", "Bubble"],
      rows: [
        {
          label: "What drives the pinch",
          a: "surface tension, $\\gamma\\kappa \\sim \\gamma/h$",
          b: "the liquid's inertia, $\\sigma_I \\sim \\rho\\dot h^{2}$",
        },
        {
          label: "Neck geometry",
          a: "a slender <strong>axial</strong> thread",
          b: "a <strong>radial</strong> cavity collapse",
        },
        {
          label: "Elastic stress builds as",
          a: "$\\sigma_{zz}\\sim G(h_0/h)^{4}$",
          b: "$\\sigma_{rr}\\sim G(h_0/h)^{2}$",
        },
        {
          label: "…vs the drive → fate",
          a: "<strong>faster</strong> (4 vs 1): a thread; singularity removed",
          b: "<strong>same</strong> rate (2 vs 2): it pinches; singularity survives",
        },
      ],
      note: "The elastic stress in a drop outgrows its capillary drive, while that in a bubble just balances its inertial drive.<br />Same additive (polymers), contrasting fates — reading how elasticity rewrites singularities can teach us to control breakup, critical for inkjet printing, sprays and aerosols.",
    },

  ],

  footer: {
    qr: {
      url: "https://comphy-lab.org",
      title: "Find the lab",
      lines: ["Papers, code & simulations", "comphy-lab.org"],
      img: "assets/figures/qr.svg",
    },
    contact: [
      "<b>Vatsal Sanjay</b> · CoMPhy Lab, Department of Physics, Durham University",
      "<span class=\"mono\">vatsal.sanjay@comphy-lab.org</span>",
    ],
    ack: "Simulations with <b>Basilisk C</b> (Popinet, <i>J. Comput. Phys.</i> <b>228</b>, 5838, 2009) on Durham's <b>Hamilton</b> HPC. A CoMPhy Lab (Durham) × Physics of Fluids (Twente) collaboration.",
    partners: [
      { src: "assets/logos/durham-university.svg", alt: "Durham University", treatment: "multiply" },
      { src: "assets/logos/physics-of-fluids.svg", alt: "Physics of Fluids", treatment: "normal" },
      { src: "assets/logos/basilisk.svg", alt: "Basilisk", treatment: "normal" },
    ],
  },
};

export default poster;
