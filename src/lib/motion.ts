"use client";

/**
 * Display mode. 3D is the scroll-driven experience; 2D is a static page with
 * no animation at all. The choice is stored and resolved before paint by the
 * inline script in the root layout, which adds `.still` to <html> for 2D —
 * visitors whose OS asks for reduced motion start in 2D until they pick 3D.
 * Everything (CSS, GSAP, Lenis, the 3D canvas) reads that one class.
 */

export type Mode = "2d" | "3d";
export const MODE_KEY = "mode";

export const isStill = () => typeof document !== "undefined" && document.documentElement.classList.contains("still");

/**
 * False once the no-JS safety net in the root layout has force-shown hidden
 * content — entrance animations must not hide it again.
 */
export const canReveal = () => document.documentElement.classList.contains("js-motion");

export function setMode(mode: Mode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Storage blocked: carry the choice in the URL instead (the layout script reads it too).
    const url = new URL(window.location.href);
    url.searchParams.set(MODE_KEY, mode);
    window.location.assign(url);
    return;
  }
  // Animations are wired up once on load and the page height differs per mode,
  // so start fresh from the top.
  window.scrollTo(0, 0);
  window.location.reload();
}
