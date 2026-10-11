"use client";

import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { isStill } from "@/lib/motion";
import { useReveal } from "@/lib/useReveal";
import { foundations, skillGroups, skillUsage } from "@/content/skills";

const usedIn = (skill: string) => skillUsage[skill] ?? [];

export function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(skillGroups[0].id);
  const [hovered, setHovered] = useState<string | null>(null);
  useReveal(root);

  const group = skillGroups.find((g) => g.id === active)!;
  const usage = useMemo(() => Object.fromEntries(group.items.map((s) => [s, usedIn(s)])), [group]);

  // Scroll-linked marquee — moves with the page, never on its own
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((row, i) => {
          gsap.fromTo(
            row,
            { xPercent: i % 2 ? -25 : 0 },
            { xPercent: i % 2 ? 0 : -25, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
          );
        });
      });
    },
    { scope: root },
  );

  // Re-stage the list whenever the group changes
  useGSAP(
    () => {
      if (!listRef.current || isStill()) return;
      gsap.fromTo(
        listRef.current.children,
        { yPercent: 60, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.035, ease: "expo.out" },
      );
    },
    { dependencies: [active], scope: listRef },
  );

  const words = ["C++", "Python", "TypeScript", "JavaScript", "Assembly 8086", "C"];

  return (
    <section ref={root} id="stack" aria-labelledby="stack-title" className="relative overflow-hidden border-t border-line bg-ink-2 py-28 md:py-40">
      <div aria-hidden className="pointer-events-none mb-20 select-none space-y-2 md:mb-28">
        {[0, 1].map((r) => (
          <div key={r} data-marquee className="flex w-max gap-10 whitespace-nowrap">
            {[...words, ...words, ...words].map((w, i) => (
              <span
                key={i}
                className={`display text-[clamp(3.5rem,10vw,10rem)] ${(i + r) % 3 === 0 ? "text-paper" : "text-transparent [-webkit-text-stroke:1px_var(--line-strong)]"}`}
              >
                {w}
                <span className="text-volt">{(i + r) % 3 === 0 ? "." : ""}</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="gutter">
        <div className="mb-16 grid gap-8 md:grid-cols-12">
          <p data-reveal="fade" className="eyebrow md:col-span-3">
            <span className="text-volt">Chapter 03</span>, Capabilities
          </p>
          <div className="md:col-span-9">
            <h2 id="stack-title" data-reveal="lines" className="display text-[clamp(2.8rem,6.5vw,6.5rem)]">
              The toolkit, <span className="font-serif font-normal italic tracking-normal">mapped to the work.</span>
            </h2>
            <p data-reveal="fade" className="mt-6 max-w-xl text-lg text-paper-dim">
              Pick a layer, then a technology, to see where I&apos;ve actually used it.
            </p>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          <div role="tablist" aria-label="Skill groups" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-2 md:col-span-3 md:flex-col md:overflow-visible">
            {skillGroups.map((g, i) => (
              <button
                key={g.id}
                role="tab"
                id={`tab-${g.id}`}
                aria-selected={g.id === active}
                aria-controls="skill-panel"
                tabIndex={g.id === active ? 0 : -1}
                onClick={() => setActive(g.id)}
                onKeyDown={(e) => {
                  const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
                  if (!dir) return;
                  e.preventDefault();
                  const next = skillGroups[(i + dir + skillGroups.length) % skillGroups.length];
                  setActive(next.id);
                  document.getElementById(`tab-${next.id}`)?.focus();
                }}
                className="group flex shrink-0 items-center justify-between gap-6 rounded-full border border-line px-5 py-3 text-left text-sm text-paper-dim transition-colors hover:text-paper aria-selected:border-volt aria-selected:bg-volt aria-selected:text-volt-ink md:rounded-2xl md:py-4"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-[0.65rem] opacity-60">0{i + 1}</span>
                  {g.label}
                </span>
                <span className="hidden font-mono text-xs opacity-60 md:inline">{g.items.length}</span>
              </button>
            ))}
          </div>

          <div id="skill-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="md:col-span-9">
            <p className="mb-6 text-paper-dim">{group.blurb}</p>
            <ul ref={listRef} className="border-t border-line">
              {group.items.map((s) => {
                const used = usage[s];
                const on = hovered === s;
                return (
                  <li key={s} className="overflow-hidden border-b border-line">
                    <button
                      type="button"
                      onMouseEnter={() => setHovered(s)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(s)}
                      onBlur={() => setHovered(null)}
                      onClick={() => setHovered((h) => (h === s ? null : s))}
                      aria-expanded={on}
                      className="grid w-full gap-1 py-4 text-left md:grid-cols-[1fr_auto] md:items-center md:gap-6"
                    >
                      <span className={`text-[clamp(1.6rem,3.2vw,2.8rem)] font-medium tracking-tight transition-all duration-500 ease-out-expo ${on ? "translate-x-3 text-volt" : "text-paper"}`}>
                        {s}
                      </span>
                      <span className={`font-mono text-xs transition-colors duration-300 ${used.length ? (on ? "text-paper" : "text-paper-mute") : "text-paper-mute/60"}`}>
                        {used.length ? `Used in → ${used.join(", ")}` : "Coursework & practice"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-24 grid gap-8 border-t border-line pt-10 md:grid-cols-12">
          <p data-reveal="fade" className="eyebrow md:col-span-3">Foundations</p>
          <ul data-reveal="fade" data-stagger className="flex flex-wrap gap-x-6 gap-y-3 md:col-span-9">
            {foundations.map((f) => (
              <li key={f} className="text-xl text-paper-dim md:text-2xl">
                {f}
                <span className="ml-6 text-volt" aria-hidden>
                  /
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
