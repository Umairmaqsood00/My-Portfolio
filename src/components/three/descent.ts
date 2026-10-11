/**
 * Choreography for the "descent" hero: one scrubbed number, `t` (0 → END),
 * drives the whole scene. GSAP tweens `t` from scroll; the R3F loop reads it
 * every frame and derives everything else from the keyframes below, so
 * scrolling backwards replays the story in reverse for free.
 */

export const END = 12;

export const WATER_Y = -58;
/** Rings the orb falls through — each one recolours it. */
export const RINGS = [-6, -18, -30, -42];
/** Where the orb floats above the water before the hand takes it. */
export const REST_Y = WATER_Y + 2.6;
export const ORB_RADIUS = 1;

/** [t, y] — eased between keys, so the orb pauses on each chapter and passes rings at speed. */
const ORB_KEYS: [number, number][] = [
  [0, 0],
  [1.0, 0],
  [2.2, -12],
  [2.9, -12],
  [4.1, -24],
  [4.8, -24],
  [6.0, -36],
  [6.7, -36],
  [7.9, -48],
  [8.4, -48],
  [9.2, REST_Y],
];

/** Scroll positions (in `t`) for the HTML overlays, shared with the section timeline. */
export const CHAPTERS = [
  { in: 1.75, out: 3.05 },
  { in: 3.65, out: 4.95 },
  { in: 5.55, out: 6.85 },
  { in: 7.45, out: 8.55 },
];
export const FINALE = { in: 10.2, out: 11.6 };

export const HAND = {
  rise: [8.9, 9.8],
  open: [9.3, 9.75],
  grip: [9.65, 10.3],
  sink: [10.5, 11.5],
} as const;

/**
 * Orb colours per stage — a: lit side, b: shadow side, c: sheen/rim.
 * Obsidian glass, then a cool → warm walk of pearls, one per ring.
 */
export const PALETTE = [
  { a: "#151b2d", b: "#05070d", c: "#c9d4f2" }, // obsidian
  { a: "#c4eeff", b: "#6aa9e8", c: "#ecfbff" }, // Interface — glacier
  { a: "#c8d0ff", b: "#717fe6", c: "#f0f2ff" }, // Logic — periwinkle
  { a: "#e0d0ff", b: "#8f74e4", c: "#f5efff" }, // Data — lilac
  { a: "#ffd3e4", b: "#c48ad6", c: "#fff2f7" }, // Intelligence — rose pearl
];

export type DescentState = {
  /** scroll story, 0 → END */
  t: number;
  /** page-load entrance, 0 → 1 */
  intro: number;
  /** normalised pointer, -1…1 */
  pointer: { x: number; y: number };
};

export const createDescentState = (): DescentState => ({ t: 0, intro: 0, pointer: { x: 0, y: 0 } });

// ─── helpers ──────────────────────────────────────────────────────────────────

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (a: number, b: number, v: number) => {
  const x = clamp01((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
export const range = (r: readonly [number, number], t: number) => smooth(r[0], r[1], t);
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

/** The orb's height for a given `t`, before the hand takes over. */
export function orbFallY(t: number) {
  if (t <= ORB_KEYS[0][0]) return ORB_KEYS[0][1];
  for (let i = 1; i < ORB_KEYS.length; i++) {
    const [t1, y1] = ORB_KEYS[i];
    if (t <= t1) {
      const [t0, y0] = ORB_KEYS[i - 1];
      return y0 + (y1 - y0) * easeInOut((t - t0) / (t1 - t0));
    }
  }
  return ORB_KEYS[ORB_KEYS.length - 1][1];
}

/** How many rings sit above the orb — its colour stage. */
export const stageAt = (y: number) => RINGS.reduce((n, ringY) => (y < ringY ? n + 1 : n), 0);
