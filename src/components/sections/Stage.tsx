"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { gsap, SplitText, useGSAP, MOTION_OK, MOTION_REDUCED } from "@/lib/gsap";
import { createStageState } from "@/components/three/stageState";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { layers } from "@/content/skills";
import { site } from "@/content/site";
import { LayerStackFallback } from "./LayerStackFallback";

const WorkstationCanvas = dynamic(() => import("@/components/three/WorkstationCanvas"), { ssr: false });

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
const noopSubscribe = () => () => {};

/**
 * Hero + signature scene on one sticky stage.
 * The page-load entrance opens the laptop; a single scrubbed timeline then
 * centres it, explodes it into four layers, names each one, reassembles it
 * and hands off to the projects. Scrolling backwards reverses everything.
 */
export function Stage() {
  const stage = useRef<HTMLElement>(null);
  const [state] = useState(createStageState);
  const detected = useSyncExternalStore(noopSubscribe, supportsWebGL, () => null);
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

  // Only render frames while the stage is on screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pointer parallax (fine pointers only; touch devices keep it still).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      state.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [state]);

  // Entrance: plays once the canvas exists (or immediately without WebGL).
  useGSAP(
    () => {
      if (webgl === null || (webgl && !ready && !slow)) return;
      (window as Window & { __revealed?: boolean }).__revealed = true;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const name = SplitText.create("[data-hero-name]", { type: "chars", mask: "chars", charsClass: "split-char" });
        const intro = SplitText.create("[data-hero-intro]", { type: "lines", mask: "lines", linesClass: "split-line" });
        gsap.set("[data-hero-reveal], [data-hero-name], [data-hero-intro]", { autoAlpha: 1 });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from(name.chars, { yPercent: 115, duration: 1.4, stagger: 0.035 }, 0.1)
          .from("[data-hero-eyebrow]", { y: 16, autoAlpha: 0, duration: 1 }, 0.25)
          .from(intro.lines, { yPercent: 110, duration: 1.2, stagger: 0.08 }, 0.55)
          .from("[data-hero-cta] > *", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.8)
          .from("[data-hero-meta]", { autoAlpha: 0, duration: 1.2 }, 1.1)
          .fromTo("[data-canvas]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power2.out" }, 0.2)
          .to(state, { intro: 1, duration: 2.4, ease: "power3.inOut" }, 0.35);

        return () => {
          name.revert();
          intro.revert();
        };
      });

      mm.add(MOTION_REDUCED, () => {
        gsap.set("[data-canvas], [data-hero-reveal]", { autoAlpha: 1 });
        state.intro = 1;
      });
    },
    { scope: stage, dependencies: [webgl, ready || slow] },
  );

  // Scroll story
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        // 0 → 1.2 · hero clears, laptop moves to centre stage
        tl.to("[data-hero-out]", { yPercent: -18, autoAlpha: 0, duration: 1, ease: "power2.in" }, 0)
          .to("[data-hero-name-wrap]", { yPercent: -30, autoAlpha: 0, duration: 1.1, ease: "power2.in" }, 0)
          .to(state, { center: 1, duration: 1.4, ease: "power1.inOut" }, 0.1)
          .to(state, { orbit: 1, duration: 1.8, ease: "power1.inOut" }, 0.9);

        // 1 → 2.8 · chapter title
        tl.fromTo("[data-chapter]", { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, 1.0)
          .to("[data-chapter]", { autoAlpha: 0, y: -60, duration: 0.5, ease: "power2.in" }, 3.0);

        // 2 → 4.6 · exploded view
        tl.to(state, { explode: 1, duration: 2.6, ease: "power1.inOut" }, 2.0);
        tl.fromTo("[data-rail]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 3.2);

        // 3.4 → 8 · one layer at a time
        layers.forEach((layer, i) => {
          const at = 3.4 + i * 1.15;
          const sel = `[data-layer="${layer.id}"]`;
          tl.fromTo(sel, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, at)
            .to(state.focus, { [layer.id]: 1, duration: 0.4, ease: "power1.out" }, at)
            .to(`[data-rail-step="${i}"]`, { scaleX: 1, duration: 0.9 }, at)
            .to(sel, { autoAlpha: 0, y: -50, duration: 0.4, ease: "power2.in" }, at + 0.8)
            .to(state.focus, { [layer.id]: 0, duration: 0.4, ease: "power1.in" }, at + 0.8);
        });
        tl.to("[data-rail]", { autoAlpha: 0, duration: 0.3 }, 8.0);

        // 8 → 9.3 · reassemble
        tl.to(state, { explode: 0, duration: 1.3, ease: "power2.inOut" }, 8.0)
          .to(state, { orbit: 0, duration: 1.3, ease: "power2.inOut" }, 8.0)
          .fromTo("[data-finale]", { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 8.7);

        // 9.3 → 10.4 · hand off to the projects
        tl.to(state, { exit: 1, duration: 1.1, ease: "power2.in" }, 9.4)
          .to("[data-finale]", { autoAlpha: 0, y: -40, duration: 0.6, ease: "power2.in" }, 9.8)
          .to("[data-canvas]", { autoAlpha: 0, duration: 0.8 }, 9.7);
      });
    },
    { scope: stage },
  );

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo(id);
  };

  return (
    <section
      ref={stage}
      id="top"
      aria-label="Introduction"
      className="relative h-[620svh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:relative">
        {/* backdrop */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_65%_55%,#141a10_0%,var(--ink)_70%)]" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:radial-gradient(ellipse_60%_55%_at_60%_50%,black,transparent)]"
        />

        {/* Name sits behind the laptop for depth */}
        <div data-hero-name-wrap className="gutter pointer-events-none absolute inset-x-0 top-[14svh] z-0 md:top-[16svh]">
          <h1 className="sr-only">
            {site.name}, {site.role}
          </h1>
          <div aria-hidden data-hero-name className="display text-[clamp(4.2rem,12.5vw,13rem)] text-paper">
            <span className="block">{site.firstName}</span>
            <span className="block pl-[0.06em] text-paper/90">
              {site.lastName}
              <span className="text-volt">.</span>
            </span>
          </div>
        </div>

        {/* 3D */}
        <div data-canvas className="pointer-events-none invisible absolute inset-0 z-10">
          {webgl === true && (
            <WorkstationCanvas state={state} active={active} onReady={() => setReady(true)} onError={() => setFailed(true)} />
          )}
          {webgl === false && <LayerStackFallback />}
        </div>

        {/* Hero copy */}
        <div data-hero-out className="gutter absolute inset-x-0 bottom-0 z-20 pb-[max(2rem,5svh)]">
          <div className="grid items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-6 lg:col-span-5">
              <p data-hero-eyebrow data-hero-reveal className="eyebrow mb-5 flex items-center gap-3 text-paper-dim">
                <span className="inline-block size-1.5 rounded-full bg-volt shadow-[0_0_12px_var(--volt)]" />
                {site.role}, {site.location}
              </p>
              <p data-hero-intro className="max-w-[34rem] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-snug text-paper-dim">
                <span className="font-serif text-[1.25em] italic text-paper">Building intelligent products, end to end. </span>
                {site.intro}
              </p>
              <div data-hero-cta className="mt-8 flex flex-wrap gap-3">
                <a href="#work" onClick={go("#work")} data-hero-reveal className="group inline-flex items-center gap-3 rounded-full bg-volt px-6 py-3.5 text-sm font-medium text-volt-ink transition-transform duration-500 ease-out-expo hover:-translate-y-0.5">
                  Explore my work
                  <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5">↓</span>
                </a>
                <a href="#contact" onClick={go("#contact")} data-hero-reveal className="inline-flex items-center rounded-full border border-line-strong px-6 py-3.5 text-sm text-paper transition-colors hover:border-paper">
                  Get in touch
                </a>
                <a href={site.resume} download data-hero-reveal className="inline-flex items-center rounded-full px-4 py-3.5 text-sm text-paper-dim underline-offset-4 transition-colors hover:text-paper hover:underline">
                  Résumé (PDF)
                </a>
              </div>
            </div>
            <div data-hero-meta data-hero-reveal className="hidden items-end justify-end gap-10 motion-reduce:!hidden md:col-span-6 md:flex lg:col-span-7">
              <div className="eyebrow flex items-center gap-3">
                <span className="relative block h-9 w-px overflow-hidden bg-line-strong">
                  <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_2.2s_var(--ease-out)_infinite] bg-volt" />
                </span>
                Scroll to take it apart
              </div>
            </div>
          </div>
        </div>

        {/* Chapter title */}
        <div data-chapter className="gutter invisible absolute inset-x-0 bottom-[8svh] z-20 motion-reduce:hidden md:bottom-auto md:top-1/2 md:max-w-[46rem] md:-translate-y-1/2">
          <p className="eyebrow mb-5 text-volt">Chapter 01, Anatomy of a build</p>
          <h2 className="display text-[clamp(2.6rem,6.2vw,5.8rem)] leading-[0.95]">
            Every product is a stack of <span className="font-serif font-normal italic tracking-normal">layers.</span>
          </h2>
          <p className="mt-6 max-w-md text-paper-dim">I work across all four. Keep scrolling to take one apart.</p>
        </div>

        {/* Layer labels — all share one grid cell and swap in place */}
        <div className="gutter pointer-events-none absolute inset-x-0 bottom-[6svh] z-20 motion-reduce:hidden md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <div className="grid md:w-[min(30rem,40vw)]">
            {layers.map((layer, i) => (
              <div key={layer.id} data-layer={layer.id} className="invisible [grid-area:1/1]">
                <p className="eyebrow mb-4 flex items-center gap-3">
                  <span className="text-volt">0{i + 1}</span>
                  <span className="h-px w-8 bg-line-strong" />
                  {layer.part}
                </p>
                <h3 className="display text-[clamp(2.8rem,7vw,6.5rem)]">{layer.title}</h3>
                <p className="mt-4 max-w-sm text-base text-paper-dim md:text-lg">{layer.line}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {layer.tags.map((t) => (
                    <li key={t} className="rounded-full border border-line-strong bg-ink/60 px-3.5 py-1.5 font-mono text-xs text-paper backdrop-blur-sm">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Progress rail */}
        <div data-rail aria-hidden className="gutter invisible absolute inset-x-0 bottom-[6svh] z-20 hidden motion-reduce:hidden md:block">
          <div className="flex w-[min(30rem,40vw)] gap-3">
            {layers.map((l, i) => (
              <div key={l.id} className="flex-1">
                <span className="relative block h-px w-full bg-line-strong">
                  <span data-rail-step={i} className="absolute inset-0 origin-left scale-x-0 bg-volt" />
                </span>
                <span className="eyebrow mt-3 block">{l.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Finale */}
        <div data-finale className="gutter invisible absolute inset-x-0 bottom-[8svh] z-20 motion-reduce:hidden md:bottom-auto md:top-1/2 md:max-w-[40rem] md:-translate-y-1/2">
          <p className="eyebrow mb-4 text-volt">Assembled</p>
          <p className="display text-[clamp(2.4rem,5.4vw,5.2rem)] leading-[0.95]">
            Four layers. <span className="font-serif font-normal italic tracking-normal">One developer.</span>
          </p>
          <p className="mt-5 max-w-sm text-paper-dim">Here is what they become in production.</p>
        </div>
      </div>

      {/* Reduced motion: the same story as a static list */}
      <div className="gutter hidden py-24 motion-reduce:block">
        <p className="eyebrow mb-6 text-volt">Anatomy of a build</p>
        <div className="grid gap-10 md:grid-cols-4">
          {layers.map((layer, i) => (
            <div key={layer.id} className="border-t border-line pt-6">
              <p className="eyebrow mb-3">0{i + 1} · {layer.part}</p>
              <h3 className="text-3xl font-medium">{layer.title}</h3>
              <p className="mt-3 text-paper-dim">{layer.line}</p>
              <p className="mt-4 font-mono text-xs text-paper">{layer.tags.join(" · ")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
