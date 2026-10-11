"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register once, client-side only.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1.1 });
}

// 2D mode (see lib/motion.ts) switches every GSAP animation off. The OS
// reduced-motion preference is already folded into that choice.
const still = typeof document !== "undefined" && document.documentElement.classList.contains("still");
export const MOTION_OK = still ? "not all" : "all";
export const MOTION_REDUCED = still ? "all" : "not all";

export { gsap, ScrollTrigger, SplitText, useGSAP };
