"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { gsap, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";
import { CHAPTERS, END, FINALE, REST_Y, createDescentState, orbFallY } from "@/components/three/descent";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { canReveal, isStill, setMode } from "@/lib/motion";
import { layers } from "@/content/skills";
import { site } from "@/content/site";

const DescentCanvas = dynamic(() => import("@/components/three/DescentCanvas"), { ssr: false });

let webglSupport: boolean | undefined;
function supportsWebGL() {
  if (webglSupport === undefined) {
    try {
      const c = document.createElement("canvas");
      webglSupport = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
/** Phones and tablets: a lighter scene (see DescentCanvas). Slow desktops are caught by its frame watchdog. */
const isLowPower = () => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
const noopSubscribe = () => () => {};

/**
 * Hero + signature scene. A dark orb sits between rocks; scrolling drops it
 * down a shaft through four rings — one per layer of the stack — each
 * recolouring it, until a hand rises from black water and takes it under.
 * One scrubbed timeline drives the 3D (`state.t`) and every overlay.
 */
export function Descent() {
  const root = useRef<HTMLElement>(null);
  const depthRef = useRef<HTMLSpanElement>(null);
  const [state] = useState(createDescentState);
  const still = useSyncExternalStore(noopSubscribe, isStill, () => false);
  const detected = useSyncExternalStore(noopSubscribe, supportsWebGL, () => null);
  const low = useSyncExternalStore(noopSubscribe, isLowPower, () => false);
  const [failed, setFailed] = useState(false);
  const webgl = failed ? false : detected;
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const scrollTo = useScrollTo();

  useEffect(() => {
    // Never hold the hero copy hostage to a slow GPU / chunk download.
    const t = window.setTimeout(() => setSlow(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  // Only render frames while the section is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pointer parallax (fine pointers only).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      state.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [state]);

  // Entrance (3D only — 2D shows everything as it is, via CSS)
  useGSAP(
    () => {
      if (still || webgl === null || (webgl && !ready && !slow)) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo("[data-canvas]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 2, ease: "power2.out" }, 0).to(
          state,
          { intro: 1, duration: 3, ease: "power3.inOut" },
          0.1,
        );
        // The no-JS safety net already showed the copy: don't hide it again.
        if (!canReveal()) return;

        const name = SplitText.create("[data-hero-name]", { type: "chars", mask: "chars", charsClass: "split-char" });
        const intro = SplitText.create("[data-hero-intro]", { type: "lines", mask: "lines", linesClass: "split-line" });
        gsap.set("[data-hero-reveal], [data-hero-name], [data-hero-intro]", { autoAlpha: 1 });

        // Both ends explicit everywhere (see useReveal), and the CTA row moves as
        // one — its links carry their own hover transitions.
        tl.fromTo(name.chars, { yPercent: 115 }, { yPercent: 0, duration: 1.4, stagger: 0.04 }, 0.6)
          .fromTo("[data-hero-eyebrow]", { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 0.8)
          .fromTo(intro.lines, { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.08 }, 1.0)
          .fromTo("[data-hero-cta]", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 1.2)
          .fromTo("[data-hero-meta]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 1.5);

        return () => {
          name.revert();
          intro.revert();
        };
      });
    },
    { scope: root, dependencies: [still, webgl, ready || slow] },
  );

  // Scroll story
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const maxDepth = -REST_Y;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 1 },
          onUpdate: () => {
            if (depthRef.current) depthRef.current.textContent = String(Math.round(Math.min(maxDepth, -orbFallY(state.t)))).padStart(2, "0");
          },
        });

        tl.to(state, { t: END, duration: END }, 0);

        // hero clears
        tl.fromTo("[data-hero-top]", { yPercent: 0, autoAlpha: 1 }, { yPercent: -40, autoAlpha: 0, duration: 0.9, ease: "power2.in" }, 0.2)
          .fromTo("[data-hero-out]", { y: 0, autoAlpha: 1 }, { y: 40, autoAlpha: 0, duration: 0.8, ease: "power2.in" }, 0.15)
          .fromTo("[data-gauge]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.0)
          .to("[data-gauge]", { autoAlpha: 0, duration: 0.5 }, 9.6);

        // one chapter per ring
        layers.forEach((layer, i) => {
          const sel = `[data-chapter="${layer.id}"]`;
          const c = CHAPTERS[i];
          tl.fromTo(sel, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, c.in).to(
            sel,
            { autoAlpha: 0, y: -50, duration: 0.4, ease: "power2.in" },
            c.out - 0.4,
          );
        });

        // the catch
        tl.fromTo("[data-finale]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, FINALE.in)
          .to("[data-finale]", { autoAlpha: 0, y: -40, duration: 0.5, ease: "power2.in" }, FINALE.out - 0.5)
          .to("[data-canvas]", { autoAlpha: 0, duration: 0.5 }, END - 0.5);
      });
    },
    { scope: root },
  );

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(id);
  };

  return (
    <section ref={root} id="top" aria-label="Introduction" className="relative h-[1000svh] still:h-auto">
      <div className="sticky top-0 h-svh overflow-hidden bg-[#020203] still:relative">
        {/* 3D — or, in 2D mode / without WebGL, a still orb (server-rendered, so no pop-in) */}
        <div data-canvas className="pointer-events-none invisible absolute inset-0 z-0 still:visible">
          <OrbStill className={webgl === false ? "grid" : "hidden still:grid"} />
          {webgl === true && !still && (
            <DescentCanvas state={state} active={active} low={low} onReady={() => setReady(true)} onError={() => setFailed(true)} />
          )}
        </div>

        {/* Hero: name above the orb */}
        <div data-hero-top className="gutter pointer-events-none absolute inset-x-0 top-[13svh] z-10 text-center md:top-[11svh]">
          <h1 className="sr-only">
            {site.name}, {site.role}
          </h1>
          <p data-hero-eyebrow data-hero-reveal className="eyebrow mb-4 text-paper-dim">
            {site.role}, {site.location}
          </p>
          <div aria-hidden data-hero-name className="display text-[clamp(3.4rem,9vw,8.5rem)] text-paper">
            {site.firstName} <span className="font-serif font-normal italic tracking-normal">{site.lastName}</span>
          </div>
        </div>

        {/* Hero: intro + actions */}
        <div data-hero-out className="gutter absolute inset-x-0 bottom-0 z-10 pb-[max(2rem,5svh)]">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-[34rem]">
              <p data-hero-intro className="text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.05] text-paper">
                Building <span className="font-serif italic">intelligent</span> products,
                <br />
                end to end.
              </p>
              <div data-hero-cta className="mt-7 flex flex-wrap gap-3">
                <a href="#work" onClick={go("#work")} data-hero-reveal className="group inline-flex items-center gap-3 rounded-full bg-paper px-6 py-3.5 text-sm font-medium text-ink transition-transform duration-500 ease-out-expo hover:-translate-y-0.5">
                  Explore my work
                  <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5">↓</span>
                </a>
                <a href="#contact" onClick={go("#contact")} data-hero-reveal className="inline-flex items-center rounded-full border border-line-strong px-6 py-3.5 text-sm text-paper transition-colors hover:border-paper">
                  Get in touch
                </a>
              </div>
            </div>
            <div data-hero-meta data-hero-reveal className="eyebrow hidden items-center gap-3 text-paper-dim still:!hidden md:flex">
              <span className="relative block h-9 w-px overflow-hidden bg-line-strong">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_2.2s_var(--ease-out)_infinite] bg-paper" />
              </span>
              Scroll to dive in
            </div>
            <SwitchTo3D className="hidden still:inline-flex [.phone_&]:hidden" />
          </div>
        </div>

        {/* Depth gauge */}
        <div data-gauge aria-hidden className="gutter invisible absolute bottom-[6svh] right-0 z-10 hidden text-right still:hidden md:block">
          <p className="eyebrow">Depth</p>
          <p className="mt-1 font-mono text-2xl tabular-nums text-paper">
            −<span ref={depthRef}>00</span>
            <span className="text-paper-mute"> m</span>
          </p>
        </div>

        {/* Chapters — all share one grid cell and swap in place */}
        <div className="gutter pointer-events-none absolute inset-x-0 bottom-[7svh] z-10 still:hidden md:bottom-auto md:top-[20svh]">
          <div className="grid md:w-[min(28rem,38vw)] md:pl-[4vw]">
            {layers.map((layer, i) => (
              <div key={layer.id} data-chapter={layer.id} className="invisible [grid-area:1/1]">
                <p className="eyebrow mb-4 flex items-center gap-3">
                  <span className="text-paper">0{i + 1}</span>
                  <span className="h-px w-8 bg-line-strong" />
                  Ring {i + 1} of {layers.length}
                </p>
                <h2 className="font-serif text-[clamp(3rem,6.5vw,6rem)] italic leading-[0.95]">{layer.title}.</h2>
                <p className="mt-5 max-w-sm text-base text-paper-dim md:text-lg">{layer.line}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {layer.tags.map((t) => (
                    <li key={t} className="rounded-full border border-line-strong bg-ink/50 px-3.5 py-1.5 font-mono text-xs text-paper backdrop-blur-sm">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Finale */}
        <div data-finale className="gutter pointer-events-none invisible absolute inset-x-0 top-[14svh] z-10 text-center still:hidden">
          <p className="display text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.95]">
            Ideas float.
            <br />
            <span className="font-serif font-normal italic tracking-normal">I help them land.</span>
          </p>
          <p className="mx-auto mt-6 max-w-sm text-paper-dim">Two products I&apos;ve shipped so far.</p>
        </div>
      </div>

      {/* 2D: the same story as a static list */}
      <div className="gutter hidden py-24 still:block">
        <div className="mb-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line p-5 [.phone_&]:hidden">
          <p className="max-w-xl text-sm text-paper-dim">
            You&apos;re viewing the 2D version, a still page with no animation. Switch to 3D for the scroll-driven dive.
          </p>
          <SwitchTo3D />
        </div>
        <p className="eyebrow mb-6">What I build with</p>
        <div className="grid gap-10 md:grid-cols-4">
          {layers.map((layer, i) => (
            <div key={layer.id} className="border-t border-line pt-6">
              <p className="eyebrow mb-3">0{i + 1}</p>
              <h2 className="font-serif text-4xl italic">{layer.title}.</h2>
              <p className="mt-3 text-paper-dim">{layer.line}</p>
              <p className="mt-4 font-mono text-xs text-paper">{layer.tags.join(" · ")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 2D only: jump to the full experience (same as the nav switch). */
function SwitchTo3D({ className = "inline-flex" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => setMode("3d")}
      className={`${className} items-center gap-3 rounded-full border border-line-strong px-5 py-3 text-sm text-paper transition-colors hover:border-paper`}
    >
      <span aria-hidden>▶</span> Switch to 3D
    </button>
  );
}

/**
 * A few twinkling stars over the render's own stardust, on a golden-angle
 * spiral. Fixed numbers, so the server and client render the same markup.
 */
const DUST = Array.from({ length: 20 }, (_, i) => {
  const angle = i * 2.39996;
  const radius = 30 + ((i * 37) % 18);
  return {
    left: `${(50 + Math.cos(angle) * radius).toFixed(2)}%`,
    top: `${(50 + Math.sin(angle) * radius * 0.75).toFixed(2)}%`,
    size: 1.5 + (i % 3),
    delay: `${((i * 0.37) % 3.2).toFixed(2)}s`,
  };
});

/**
 * The 2D orb: a Cycles render from Blender of the pearl with the site's ring
 * and a dust belt, rendered on black and screened onto the page so its bloom
 * survives. On phones, which are always 2D, it floats and the stars twinkle;
 * see `[data-ambient]` in globals.css.
 */
function OrbStill({ className }: { className: string }) {
  return (
    // The solid backdrop gives the screen blend something to blend with.
    <div className={`absolute inset-0 place-items-center overflow-hidden bg-[#020203] md:pt-[10svh] ${className}`}>
      <div className="relative aspect-square w-[min(108vw,30rem)] md:w-[min(56vw,36rem)]">
        <div
          aria-hidden
          data-ambient="aura"
          className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,rgb(150_128_255/0.4),rgb(118_96_230/0.12)_45%,transparent_70%)] blur-2xl"
        />
        <div data-ambient="float" className="absolute inset-0">
          <Image src="/images/orb-planet.webp" alt="" width={900} height={900} priority className="size-full mix-blend-screen" />
        </div>
        {DUST.map((d, i) => (
          <span
            key={i}
            aria-hidden
            data-ambient="twinkle"
            className="absolute rounded-full bg-[#ece6ff] shadow-[0_0_6px_rgb(200_188_255/0.9)]"
            style={{ left: d.left, top: d.top, width: d.size, height: d.size, opacity: 0.5, "--d": d.delay } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
