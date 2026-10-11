/**
 * A plain mutable object that GSAP timelines tween and the R3F render loop reads.
 * No React state is involved, so scrolling never causes a re-render.
 */
export type StageState = {
  /** 0 → hidden & closed, 1 → on stage with the lid open (page-load entrance) */
  intro: number;
  /** 0 → hero composition (laptop off to the side), 1 → centred for the story */
  center: number;
  /** 0 → assembled, 1 → fully exploded */
  explode: number;
  /** 0 → three-quarter view, 1 → elevated side view that reads the layers */
  orbit: number;
  /** highlight strength per layer: interface, logic, storage, compute */
  focus: { interface: number; logic: number; storage: number; compute: number };
  /** 0 → in view, 1 → receded at the end of the scene */
  exit: number;
  /** normalised pointer, -1…1 */
  pointer: { x: number; y: number };
};

export const createStageState = (): StageState => ({
  intro: 0,
  center: 0,
  explode: 0,
  orbit: 0,
  focus: { interface: 0, logic: 0, storage: 0, compute: 0 },
  exit: 0,
  pointer: { x: 0, y: 0 },
});
