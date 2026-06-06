/**
 * Type model for a CoMPhy Lab A0 poster.
 *
 * Content is data; layout is `poster.ts`. Strings may contain inline HTML
 * (`<strong>`, `<em>`, `<code>`, `<sub>`, `<sup>`, `<b>`, `<i>`) — the design
 * system styles those: `<strong>` resolves to coral, `<code>` to the mono
 * accent, and so on. Keep the voice like a methods section.
 */

export type Orientation = "portrait" | "landscape";
export type Column = "left" | "right";
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
}

export interface Hero {
  figure: Figure;
  /** Serif lede beside the hero figure; `<strong>` → coral. */
  lede: string;
}

/** A standard numbered section block. */
export interface SectionBlock {
  kind: "section";
  column: Column;
  num?: string;
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

export interface ReferencesBlock {
  kind: "references";
  column: Column;
  num?: string;
  heading: string;
  /** Each entry is HTML. */
  items: string[];
}

export interface AckBlock {
  kind: "acknowledgements";
  column: Column;
  num?: string;
  heading: string;
  body: string;
}

export type Block =
  | SectionBlock
  | KeyBlock
  | ScalingBlock
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
