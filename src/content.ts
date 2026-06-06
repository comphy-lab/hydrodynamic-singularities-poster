/**
 * Hydrodynamic Singularities — poster content.
 *
 * Built around Verschuur, Oratis, Sanjay & Snoeijer, "How elasticity affects
 * bubble pinch-off" (arXiv:2511.20075, submitted to Phys. Rev. Fluids).
 *
 * The science: a singularity is where a smooth free-surface flow blows up and
 * forgets its past; near it the dynamics are universal and self-similar. A
 * Newtonian drop neck thins as (t0-t)^{2/3}, a bubble as (t0-t)^{1/2}. A dilute
 * polymer arrests the DROP — the elastic stress diverges strongly,
 * sigma_zz ~ G(h0/h)^4, growing a beads-on-a-string thread — but barely touches
 * the BUBBLE, whose stress diverges only as sigma_rr ~ G(h0/h)^2, so no thread
 * forms in dilute solution.
 *
 * Inline HTML (src/types.ts): <strong> = coral, reserved for the ONE key noun
 * per block; <em> for softer emphasis. LaTeX goes in $…$ (inline) or $$…$$
 * (display) and is rendered by KaTeX at build time. Scaling/stress block
 * `formula` fields are raw LaTeX (rendered as display math, no $ needed).
 */

import type { PosterContent } from "./types.js";

export const poster: PosterContent = {
  meta: {
    orientation: "portrait",
    eyebrow: "Physics Staff–Student Research Poster · Durham University · 12 June 2026",
    title: "Hydrodynamic singularities",
    subtitle:
      "When a free surface pinches off, the flow forgets its past. A pinch of polymer rewrites the ending — but only for a drop, not a dilute bubble.",
    authors: [
      { name: "Coen I. Verschuur", marks: ["1"] },
      { name: "Alexandros T. Oratis", marks: ["1"] },
      { name: "Vatsal Sanjay", marks: ["1", "2"] },
      { name: "Jacco H. Snoeijer", marks: ["1"] },
    ],
    affiliations: [
      { mark: "1", text: "Physics of Fluids, University of Twente" },
      { mark: "2", text: "Computational Multiphase Physics (CoMPhy) Lab, Department of Physics, Durham University" },
    ],
  },

  labMark: { src: "assets/logos/comphy-mark.png", alt: "CoMPhy Lab" },

  hero: {
    figure: {
      src: "assets/figures/numerical_snapshots.png",
      alt: "Numerical pinch-off sequences: bubble and drop, Newtonian and viscoelastic",
      caption:
        "Direct numerical simulation (<b>Basilisk C</b>, Oldroyd-B). Top — a <b>bubble</b> neck pinches off; Newtonian (left) and viscoelastic (right) look alike. Bottom — a <b>drop</b> neck; Newtonian (left) pinches, but the same polymer (right) draws out a long, persistent thread.",
    },
    lede:
      "A <strong>singularity</strong> is where a smooth flow blows up — a finite quantity racing to infinity in a finite time. As a free surface pinches, the neck radius $h$ collapses to zero and the dynamics turn self-similar, $h \\sim (t_0-t)^{\\alpha}$: the flow forgets how it began. A dilute polymer then changes the route to pinch-off — for a drop, but not for a bubble.",
    plots: {
      src: "assets/figures/hero_scaling.png",
      alt: "Neck radius h(t) for a drop and a bubble, with log-log insets showing the self-similar scaling exponents",
      caption:
        "Newtonian neck radius $h(t)$ — a drop thins as $(t_0-t)^{2/3}$, a bubble as $(t_0-t)^{1/2}$ (insets, log–log). <i>Axes shown — data to follow.</i>",
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
        "Pinch-off, coalescence, the snap of a sheet or jet — soft-matter flows routinely concentrate geometry, stress and time into a single point, where the neck radius, the curvature and the strain rate diverge together.",
        "Near pinch-off the flow loses memory of how it began: the neck thins self-similarly, $h \\sim (t_0-t)^{\\alpha}$, with $\\alpha = 2/3$ for a Newtonian drop and $\\alpha \\simeq 1/2$ for a bubble.",
      ],
    },
    {
      kind: "section",
      column: "left",
      heading: "Drops: a thread arrests pinch-off",
      body: [
        "A Newtonian drop reaches a finite-time singularity. Add a dilute polymer and the chains stretch along the neck, building an elastic stress that diverges strongly, $\\sigma_{zz} \\sim G\\,(h_0/h)^{4}$, and halts the collapse.",
        "The neck survives as a slender filament — the classic <strong>beads-on-a-string</strong>.",
      ],
      figure: {
        src: "assets/figures/drop_experiment_two_rows.png",
        alt: "Experimental drop pinch-off: Newtonian row and elastic row",
        caption:
          "<b>Drop pinch-off.</b> Top: a Newtonian neck thins to a true finite-time singularity. Bottom: a dilute polymer turns the neck into a persistent beads-on-a-string filament.",
      },
      outcome: { text: "Dilute polymer → a thread; pinch-off arrested", tone: "coral" },
    },

    // ---------- RIGHT COLUMN: mechanism → bubbles ----------
    {
      kind: "scaling",
      column: "right",
      heading: "Why elasticity picks sides",
      formula:
        "\\underbrace{\\sigma_{zz}\\sim G\\!\\left(\\tfrac{h_0}{h}\\right)^{4}}_{\\text{drop}}\\ \\ \\gg\\ \\ \\underbrace{\\sigma_{rr}\\sim G\\!\\left(\\tfrac{h_0}{h}\\right)^{2}}_{\\text{bubble}}",
      note: "Both stresses are singular at pinch-off, but the bubble's diverges far more weakly — a drop's balance is axial and capillary, a bubble's is radial and inertial. So a dilute polymer grows a thread on a drop, while a bubble pinches like a Newtonian fluid until the elastocapillary number $\\mathrm{Ec}=G h_0/\\gamma$ is pushed up by high concentration.",
    },
    {
      kind: "section",
      column: "right",
      heading: "Bubbles: the singularity survives",
      body: [
        "A bubble neck pinches just as sharply, $h \\sim (t_0-t)^{1/2}$, but the weak stress cannot organise a thread in a dilute solution — the pinch-off stays Newtonian-like.",
        "A thread appears only at <strong>high polymer concentration</strong>, where it becomes sensitive to the size of the needle the bubble detaches from.",
      ],
      figure: {
        src: "assets/figures/bubble_experiment_two_rows.png",
        alt: "Experimental bubble pinch-off: Newtonian row and viscoelastic row",
        caption:
          "<b>Bubble pinch-off.</b> Top: Newtonian. Bottom: viscoelastic. In the dilute limit the two near-singular sequences are almost indistinguishable.",
      },
      outcome: { text: "Dilute polymer → no thread; pinch-off survives", tone: "teal" },
    },

    // ---------- FULL-WIDTH: synthesis ----------
    {
      kind: "key",
      column: "full",
      heading: "What it tells us",
      items: [
        "One polymer additive, two free surfaces, <strong>opposite fates</strong>: a thread arrests the drop, while the dilute bubble pinches like a Newtonian fluid.",
        "The split is set by how strongly the elastic stress diverges near the singularity — as $(h_0/h)^{4}$ for a drop versus $(h_0/h)^{2}$ for a bubble.",
        "Captured by direct simulation and an Oldroyd-B model. Singularities are where flows turn universal; knowing which ones elasticity can tame guides how we control breakup, sprays and aerosols.",
      ],
    },

    // ---------- FULL-WIDTH: endmatter ----------
    {
      kind: "references",
      column: "full",
      heading: "References",
      items: [
        "<b>Verschuur, C. I., Oratis, A. T., Sanjay, V. &amp; Snoeijer, J. H.</b> How elasticity affects bubble pinch-off. <i>arXiv</i>:2511.20075 (2026); submitted to <i>Phys. Rev. Fluids</i>.",
        "<b>Eggers, J.</b> Nonlinear dynamics and breakup of free-surface flows. <i>Rev. Mod. Phys.</i> <b>69</b>, 865 (1997).",
        "<b>Day, R. F., Hinch, E. J. &amp; Lister, J. R.</b> Self-similar capillary pinchoff of an inviscid fluid. <i>Phys. Rev. Lett.</i> <b>80</b>, 704 (1998).",
        "<b>Burton, J. C., Waldrep, R. &amp; Taborek, P.</b> Scaling and instabilities in bubble pinch-off. <i>Phys. Rev. Lett.</i> <b>94</b>, 184502 (2005).",
        "<b>Clasen, C.</b> et al. The beads-on-string structure of viscoelastic threads. <i>J. Fluid Mech.</i> <b>556</b>, 283 (2006).",
        "<b>Eggers, J., Herrada, M. A. &amp; Snoeijer, J. H.</b> Self-similar breakup of polymeric threads as described by the Oldroyd-B model. <i>J. Fluid Mech.</i> <b>887</b>, A19 (2020).",
        "<b>Popinet, S.</b> An accurate adaptive solver for surface-tension-driven interfacial flows. <i>J. Comput. Phys.</i> <b>228</b>, 5838 (2009). <code>basilisk.fr</code>.",
      ],
    },
    {
      kind: "acknowledgements",
      column: "full",
      heading: "Acknowledgements",
      body: "Computations with <b>Basilisk C</b> on Durham's <b>Hamilton</b> HPC. A CoMPhy Lab × Physics of Fluids (Twente) collaboration.",
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
