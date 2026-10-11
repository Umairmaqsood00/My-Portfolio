"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * Declarative scroll reveals for everything inside `scope`:
 *   data-reveal="lines"  → text split into masked lines that rise in
 *   data-reveal="fade"   → fade + lift (children staggered with data-stagger)
 *   data-reveal="clip"   → wipe-in from the bottom (images, panels)
 * Optional data-delay="0.2". 2D mode gets static content.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
        const splits: SplitText[] = [];

        els.forEach((el) => {
          const kind = el.dataset.reveal;
          const delay = Number(el.dataset.delay ?? 0);
          const trigger = { trigger: el, start: "top 88%", once: true };
          gsap.set(el, { autoAlpha: 1 });

          // Every tween states both ends: `from()` would measure the element's
          // current style as the end state, and an element caught mid-transition
          // (or mid-revert in React's dev double-mount) would then never arrive.
          if (kind === "lines") {
            const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line" });
            splits.push(split);
            gsap.fromTo(split.lines, { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.09, delay, scrollTrigger: trigger });
          } else if (kind === "clip") {
            gsap.fromTo(
              el,
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", delay, scrollTrigger: trigger },
            );
          } else {
            const targets = el.hasAttribute("data-stagger") ? Array.from(el.children) : el;
            gsap.fromTo(
              targets,
              { y: 40, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.07, delay, scrollTrigger: trigger },
            );
          }
        });

        // Fonts can change line breaks after the split; re-measure once they settle.
        document.fonts?.ready.then(() => ScrollTrigger.refresh());
        return () => splits.forEach((s) => s.revert());
      });
    },
    { scope },
  );
}
