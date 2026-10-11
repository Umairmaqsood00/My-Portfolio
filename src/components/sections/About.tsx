"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { site } from "@/content/site";
import { journey } from "@/content/journey";

export function About() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Words light up as you read
        const split = SplitText.create("[data-read]", { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: "[data-read-wrap]", start: "top 80%", end: "bottom 45%", scrub: true },
          },
        );

        // Portrait: wipe in, then drift
        gsap.fromTo(
          "[data-portrait]",
          { clipPath: "inset(100% 0% 0% 0% round 24px)" },
          { clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: "[data-portrait]", start: "top 85%", once: true } },
        );
        gsap.fromTo(
          "[data-portrait] img",
          { yPercent: -8, scale: 1.15 },
          { yPercent: 8, scale: 1.05, ease: "none", scrollTrigger: { trigger: "[data-portrait]", start: "top bottom", end: "bottom top", scrub: true } },
        );

        // Timeline line draws with the scroll; dots light up as it passes them
        gsap.fromTo(
          "[data-line]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-journey]", start: "top 70%", end: "bottom 60%", scrub: true } },
        );
        gsap.utils.toArray<HTMLElement>("[data-milestone]").forEach((m) => {
          gsap.fromTo(m, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: m, start: "top 78%", once: true } });
          gsap.to(m.querySelector("[data-dot]"), {
            backgroundColor: "#b4ff39",
            boxShadow: "0 0 18px #b4ff39",
            scrollTrigger: { trigger: m, start: "top 62%", toggleActions: "play none none reverse" },
          });
        });

        return () => split.revert();
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" aria-labelledby="about-title" className="relative border-t border-line bg-ink py-28 md:py-40">
      <div className="gutter grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <p data-reveal="fade" className="eyebrow mb-8">
              <span className="text-volt">Chapter 04</span>, About
            </p>
            <div data-portrait className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border border-line">
              <Image
                src="/images/portrait.jpg"
                alt={`Portrait of ${site.name}`}
                fill
                sizes="(min-width: 768px) 30vw, 90vw"
                className="object-cover object-[50%_30%]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <p className="eyebrow absolute bottom-4 left-5 text-paper">{site.location}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 md:pl-8">
          <h2 id="about-title" data-reveal="lines" className="display mb-10 text-[clamp(2.4rem,5vw,5rem)]">
            Hi, I&apos;m {site.firstName}. <span className="font-serif font-normal italic tracking-normal">I like building the whole thing.</span>
          </h2>
          <div data-read-wrap className="max-w-[46rem] space-y-5 text-[clamp(1.05rem,1.5vw,1.35rem)] leading-relaxed">
            {site.about.map((p) => (
              <p key={p} data-read>
                {p}
              </p>
            ))}
          </div>
          <p data-reveal="fade" className="mt-10 max-w-[46rem] border-l-2 border-volt pl-6 font-serif text-[clamp(1.25rem,1.9vw,1.7rem)] italic leading-snug text-paper">
            {site.mission}
          </p>

          {/* Journey */}
          <div data-journey className="relative mt-24 md:mt-32">
            <p data-reveal="fade" className="eyebrow mb-10">Journey</p>
            <div className="relative pl-10">
              <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-line-strong" />
              <span aria-hidden data-line className="absolute bottom-2 left-[5px] top-2 w-px origin-top bg-volt" />
              <ol className="space-y-14">
                {journey.map((m) => (
                  <li key={m.period} data-milestone className="relative">
                    <span
                      aria-hidden
                      data-dot
                      className={`absolute -left-10 top-1.5 size-[11px] rounded-full border border-volt ${m.current ? "bg-volt" : "bg-ink"}`}
                    />
                    <p className="font-mono text-xs text-volt">{m.period}</p>
                    <h3 className="mt-2 text-2xl font-medium md:text-3xl">{m.title}</h3>
                    <p className="mt-1 text-paper-dim">
                      {m.place}
                      {m.detail && <span className="ml-3 font-mono text-xs text-paper-mute">Marks {m.detail}</span>}
                    </p>
                    {m.tags && (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {m.tags.map((t) => (
                          <li key={t} className="rounded-full border border-line px-3 py-1 text-xs text-paper-dim">
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div data-reveal="fade" className="mt-20 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-line pt-8">
            <span className="eyebrow mr-2">Off the keyboard</span>
            {site.hobbies.map((h, i) => (
              <span key={h} className="text-lg text-paper-dim">
                {h}
                {i < site.hobbies.length - 1 && <span className="ml-4 text-paper-mute">·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
