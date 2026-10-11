"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { archive, projects, type Project } from "@/content/projects";
import { ProjectVisual } from "@/components/projects/ProjectVisual";

export function Projects() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-project]").forEach((row) => {
          const panel = row.querySelector<HTMLElement>("[data-panel]");
          const inner = row.querySelector<HTMLElement>("[data-panel-inner]");
          const numeral = row.querySelector<HTMLElement>("[data-numeral]");

          // Panel wipes open, then its contents assemble — a small product launch
          const launch = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 75%", once: true } });
          launch
            .fromTo(panel, { clipPath: "inset(18% 10% 18% 10% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.6, ease: "expo.inOut" })
          const nodes = row.querySelectorAll("[data-node]");
          const pops = row.querySelectorAll("[data-pop]");
          if (nodes.length) launch.fromTo(nodes, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: "expo.out" }, 0.7);
          if (pops.length) launch.fromTo(pops, { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1, ease: "back.out(1.6)" }, 1.0);

          // Depth: the panel contents drift against the scroll, numerals drift with it
          if (inner) {
            gsap.fromTo(inner, { yPercent: 6 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } });
          }
          if (numeral) {
            gsap.fromTo(numeral, { yPercent: 40 }, { yPercent: -40, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } });
          }
          const parallax = row.querySelector<HTMLElement>("[data-parallax]");
          if (parallax) {
            gsap.fromTo(parallax, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } });
          }
          // Data packets keep flowing through the diagram while it's on screen
          row.querySelectorAll<HTMLElement>("[data-flow]").forEach((flow) => {
            const vertical = flow.offsetHeight > flow.offsetWidth;
            gsap.fromTo(
              flow,
              vertical ? { top: "0%", autoAlpha: 0 } : { x: -30, autoAlpha: 0 },
              {
                ...(vertical ? { top: "85%" } : { x: 30 }),
                autoAlpha: 1,
                duration: vertical ? 2.4 : 1.4,
                ease: "power1.inOut",
                repeat: -1,
                yoyo: !vertical,
                scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", toggleActions: "play pause resume pause" },
              },
            );
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" aria-labelledby="work-title" className="relative border-t border-line bg-ink py-28 md:py-40">
      <div className="gutter">
        <div className="mb-20 grid gap-8 md:mb-32 md:grid-cols-12">
          <p data-reveal="fade" className="eyebrow md:col-span-3">
            <span className="text-volt">Chapter 02</span>, Selected work
          </p>
          <div className="md:col-span-9">
            <h2 id="work-title" data-reveal="lines" className="display text-[clamp(3rem,8vw,8.5rem)]">
              Built, shipped, <span className="font-serif font-normal italic tracking-normal">learned.</span>
            </h2>
            <p data-reveal="fade" data-delay="0.2" className="mt-8 max-w-xl text-lg text-paper-dim">
              Full-stack web and mobile, each showing the problem, what I built and the stack behind it.
            </p>
          </div>
        </div>

        <ol className="space-y-28 md:space-y-48">
          {projects.map((p, i) => (
            <ProjectRow key={p.slug} project={p} flip={i % 2 === 1} />
          ))}
        </ol>

        {archive.length > 0 && <Archive />}
      </div>
    </section>
  );
}

function ProjectRow({ project: p, flip }: { project: Project; flip: boolean }) {
  return (
    <li data-project className="relative grid items-center gap-10 md:grid-cols-12 md:gap-8">
      <span
        data-numeral
        aria-hidden
        className={`display pointer-events-none absolute -top-16 select-none text-[clamp(8rem,22vw,22rem)] text-transparent [-webkit-text-stroke:1px_var(--line-strong)] md:-top-24 ${flip ? "left-0" : "right-0"}`}
      >
        {p.index}
      </span>

      <div className={`relative md:col-span-7 ${flip ? "md:order-2 md:col-start-6" : ""}`}>
        <div
          data-panel
          className="group relative aspect-[4/5] overflow-hidden sm:aspect-[4/3] rounded-[28px] border border-line bg-[radial-gradient(120%_90%_at_30%_0%,#18200f_0%,var(--ink-2)_55%)] [clip-path:inset(0_round_28px)]"
        >
          <div aria-hidden className="absolute inset-0 opacity-50 [background-image:radial-gradient(var(--line-strong)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div data-panel-inner className="relative h-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.025]">
            <ProjectVisual project={p} />
          </div>
          <p className="eyebrow absolute bottom-4 right-5 text-paper-mute">{p.image ? "Live product" : "System diagram"}</p>
        </div>
      </div>

      <div className={`relative md:col-span-5 ${flip ? "md:order-1 md:col-start-1 md:pr-8" : "md:pl-8"}`}>
        <p data-reveal="fade" className="eyebrow mb-5 flex items-center gap-3">
          <span className="text-volt">{p.index}</span>
          <span className="h-px w-8 bg-line-strong" />
          {p.kicker}
        </p>
        <h3 data-reveal="lines" className="display text-[clamp(2.4rem,4.6vw,4.4rem)]">
          {p.title}
        </h3>
        <p data-reveal="fade" className="mt-6 text-lg leading-relaxed text-paper">
          {p.summary}
        </p>

        <dl data-reveal="fade" className="mt-8 space-y-6 border-t border-line pt-6 text-sm">
          <div>
            <dt className="eyebrow mb-2">Problem</dt>
            <dd className="text-paper-dim">{p.problem}</dd>
          </div>
          <div>
            <dt className="eyebrow mb-2">What I built</dt>
            <dd>
              <ul className="space-y-1.5 text-paper-dim">
                {p.built.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-volt" />
                    {b}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <ul data-reveal="fade" data-stagger aria-label="Tech stack" className="mt-7 flex flex-wrap gap-2">
          {p.stack.map((t) => (
            <li key={t} className="rounded-full border border-line-strong px-3 py-1 font-mono text-xs text-paper-dim">
              {t}
            </li>
          ))}
        </ul>

        <div data-reveal="fade" className="mt-8 flex flex-wrap items-center gap-3">
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-volt px-5 py-2.5 text-sm font-medium text-volt-ink">
              Live site
              <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              <span className="sr-only">(opens {p.title} in a new tab)</span>
            </a>
          )}
          {p.repo && (
            <a href={p.repo} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm transition-colors hover:border-paper">
              GitHub
              <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              <span className="sr-only">(opens the {p.title} repository in a new tab)</span>
            </a>
          )}
          {p.privateRepo && !p.repo && (
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-line-strong px-4 py-2.5 font-mono text-xs text-paper-mute">
              <span aria-hidden>●</span> Private repository, walkthrough on request
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function Archive() {
  return (
    <div className="mt-32 border-t border-line pt-10 md:mt-48">
      <div className="grid gap-8 md:grid-cols-12">
        <p data-reveal="fade" className="eyebrow md:col-span-3">Earlier builds</p>
        <ul className="md:col-span-9">
          {archive.map((a) => (
            <li key={a.title} data-reveal="fade" className="border-b border-line">
              <a href={a.repo} target="_blank" rel="noreferrer" className="group grid gap-2 py-6 transition-colors md:grid-cols-[1.2fr_1fr_auto] md:items-baseline md:gap-8">
                <span className="text-2xl font-medium transition-transform duration-500 ease-out-expo group-hover:translate-x-2 group-hover:text-volt md:text-3xl">{a.title}</span>
                <span className="text-sm text-paper-dim">
                  <span className="font-mono text-xs text-paper">{a.stack}</span>
                  <br />
                  {a.note}
                </span>
                <span aria-hidden className="hidden text-xl text-paper-mute transition-all duration-500 group-hover:text-volt md:block">↗</span>
                <span className="sr-only">(GitHub, opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
