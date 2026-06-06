/**
 * Type model for a CoMPhy Lab A0 poster.
 *
 * Content is data; layout is `poster.ts`. Strings may contain inline HTML
 * (`<strong>`, `<em>`, `<code>`, `<sub>`, `<sup>`, `<b>`, `<i>`) — the design
 * system styles those: `<strong>` resolves to coral, `<code>` to the mono
 * accent, and so on. Keep the voice like a methods section.
 */

export type Orientation = "portrait" | "landscape";
/** "full" blocks span both columns in a band below the two-column body. */
export type Column = "left" | "right" | "full";
export type ChipTone = "purple" | "teal";
export type OutcomeTone = "coral" | "teal";
/** How a logo sits on warm paper without showing a white box. */
export type LogoTreatment = "normal" | "multiply" | "invert";

export interface Logo {
  /** Path relative to the repo root. */
  src: string;
  alt: string;
  treatment?: LogoTreatment;
  /** CSS height, e.g. "22mm". Defaults are set per slot in poster.ts. */
  height?: string;
}

export interface Figure {
  src: string;
  alt: string;
  /** HTML allowed; `<b>` resolves to teal in captions. */
  caption?: string;
  /** Multiply the figure onto paper so its white background drops out. Default true. */
  blend?: boolean;
}

export interface Chip {
  text: string;
  tone?: ChipTone;
}

export interface Author {
  name: string;
  /** Superscript affiliation marks, e.g. ["1", "2"]. */
  marks?: string[];
}

export interface Affiliation {
  mark: string;
  text: string;
}

export interface Meta {
  orientation: Orientation;
  eyebrow: string;
  title: string;
  /** Italic serif standfirst under the title. */
  subtitle?: string;
  authors: Author[];
  affiliations: Affiliation[];
  /** Optional secondary "with …" collaborator line under the byline. */
  collaborators?: string;
}

/** One labelled pinch-off filmstrip in the hero (a drop, then a bubble). */
export interface HeroStrip {
  /** Left-hand label, e.g. "A drop pinches off". `<strong>` → coral. */
  label: string;
  /** Optional self-similar scaling law (LaTeX, no $) pinned by the label. */
  scaling?: string;
  /** Optional one-line note under the label (e.g. timescale). */
  note?: string;
  figure: Figure;
}

export interface Hero {
  /** Serif lede above the filmstrips; the hook + what a singularity is. */
  lede: string;
  /** The pinch-off time series — drop first, then bubble. */
  strips: HeroStrip[];
  /** Shared one-line caption tying the strips together. */
  caption?: string;
}

/** A standard numbered section block. */
export interface SectionBlock {
  kind: "section";
  column: Column;
  heading: string;
  chips?: Chip[];
  body?: string[];
  items?: string[];
  figure?: Figure;
  /** A single coloured punchline chip pinned under the section. */
  outcome?: { text: string; tone: OutcomeTone };
  /** Let this block grow to push columns down to the footer. */
  grow?: boolean;
}

/** Emphasised conclusion card with the teal edge (`.block--key`). */
export interface KeyBlock {
  kind: "key";
  column: Column;
  heading: string;
  body?: string[];
  items?: string[];
  /** For `column:"full"` bands: render before ("lead") or after ("tail", default) the body columns. */
  place?: "lead" | "tail";
}

/** A mono scaling-law breadcrumb. */
export interface ScalingBlock {
  kind: "scaling";
  column: Column;
  heading: string;
  /** HTML; rendered large in mono. */
  formula: string;
  note: string;
}

/** A drop-vs-bubble comparison grid: rows (driving, resisting, geometry…) × 2 cols. */
export interface CompareBlock {
  kind: "compare";
  column: Column;
  heading: string;
  /** Column headers, e.g. ["Drop", "Bubble"]. */
  columns: [string, string];
  /** Each row: a row label and the two cell values (HTML/LaTeX allowed). */
  rows: { label: string; a: string; b: string }[];
  /** Optional closing line under the grid. */
  note?: string;
  /** Optional illustration rendered to the left of the grid. */
  figure?: Figure;
  /** For `column:"full"` bands: render before ("lead") or after ("tail", default) the body columns. */
  place?: "lead" | "tail";
}

export interface ReferencesBlock {
  kind: "references";
  column: Column;
  heading: string;
  /** Each entry is HTML. */
  items: string[];
}

export interface AckBlock {
  kind: "acknowledgements";
  column: Column;
  heading: string;
  body: string;
}

export type Block =
  | SectionBlock
  | KeyBlock
  | ScalingBlock
  | CompareBlock
  | ReferencesBlock
  | AckBlock;

export interface QR {
  url: string;
  title: string;
  lines: string[];
  /** Optional QR PNG (repo-relative). Falls back to the finder-pattern placeholder. */
  img?: string;
}

export interface Footer {
  qr: QR;
  /** Contact lines; HTML allowed (`.mono` for emails). */
  contact: string[];
  partners: Logo[];
}

export interface PosterContent {
  meta: Meta;
  /** The lab mark in the header lockup. */
  labMark: Logo;
  hero: Hero;
  blocks: Block[];
  footer: Footer;
}
