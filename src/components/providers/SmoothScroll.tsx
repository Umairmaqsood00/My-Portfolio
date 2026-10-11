"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isStill } from "@/lib/motion";

type ScrollTo = (target: string | number | HTMLElement, opts?: { offset?: number; immediate?: boolean }) => void;

const ScrollContext = createContext<ScrollTo>((target) => {
  if (typeof target === "number") window.scrollTo({ top: target });
  else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView();
});

export const useScrollTo = () => useContext(ScrollContext);

/**
 * Lenis drives the scroll position; GSAP's ticker drives Lenis, and every Lenis
 * scroll event updates ScrollTrigger — one clock for everything.
 * Disabled entirely in 2D mode (native scrolling).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const scrollTo = useCallback<ScrollTo>((target, opts) => {
    const lenis = lenisRef.current;
    if (!lenis) return fallbackScrollTo(target, opts);
    lenis.scrollTo(target, {
      offset: opts?.offset ?? 0,
      immediate: opts?.immediate,
      duration: 1.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
  }, []);

  useEffect(() => {
    // The app is alive: reveal animations own visibility from here, so the
    // layout's no-JS safety net must not fire later and make content blink.
    (window as Window & { __revealed?: boolean }).__revealed = true;
    if (isStill()) return;

    const lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 0.95,
      // Touch devices keep native momentum scrolling — it feels right there.
      syncTouch: false,
      anchors: false,
      // Only reached in 3D mode — which a reduced-motion visitor chose explicitly —
      // so don't let Lenis second-guess that from the OS setting.
      respectReducedMotion: false,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    lenisRef.current = lenis;

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <ScrollContext.Provider value={scrollTo}>{children}</ScrollContext.Provider>;
}

const fallbackScrollTo: ScrollTo = (target, opts) => {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : typeof target === "number" ? null : target;
  const top = el ? el.getBoundingClientRect().top + window.scrollY + (opts?.offset ?? 0) : (target as number);
  window.scrollTo({ top, behavior: opts?.immediate ? "auto" : "smooth" });
};
