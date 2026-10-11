"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { site } from "@/content/site";
import { canReveal } from "@/lib/motion";
import { ModeToggle } from "./ModeToggle";
import { SoundToggle } from "./SoundToggle";

const links = [
  { href: "#work", label: "Work" },
  { href: "#stack", label: "Stack" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const scrollTo = useScrollTo();

  // Active section + scroll progress
  useGSAP(
    () => {
      links.forEach(({ href }) => {
        const section = document.querySelector<HTMLElement>(href);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => setCurrent((c) => (self.isActive ? href : c === href ? null : c)),
        });
      });
      gsap.to("[data-progress]", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      });
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Hidden by CSS until now; if the no-JS safety net already showed it, leave it be.
        if (!canReveal()) return;
        gsap.fromTo(root.current, { yPercent: -100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.2, delay: 0.6, ease: "expo.out" });
      });
    },
    { scope: root },
  );

  // Close the menu with Escape and lock nothing else — the page stays scrollable.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(href);
  };

  return (
    <header ref={root} data-nav className="fixed inset-x-0 top-0 z-50">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink via-ink/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-volt" data-progress aria-hidden />
      <nav aria-label="Primary" className="gutter relative flex h-16 items-center justify-between md:h-20">
        <a href="#top" onClick={go("#top")} className="group flex items-center gap-3" aria-label={`${site.name}, back to top`}>
          <span className="grid size-9 place-items-center rounded-full border border-line-strong font-mono text-[0.7rem] tracking-wider transition-colors group-hover:border-volt group-hover:text-volt">
            UM
          </span>
          <span className="hidden text-sm text-paper-dim sm:block">{site.name}</span>
        </a>

        <div className="hidden items-center gap-1 rounded-full border border-line bg-ink/70 p-1 backdrop-blur-md md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={go(l.href)}
              aria-current={current === l.href ? "true" : undefined}
              className="rounded-full px-4 py-2 text-sm text-paper-dim transition-colors hover:text-paper aria-[current]:bg-paper aria-[current]:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={site.resume}
            download
            className="hidden rounded-full border border-line-strong px-4 py-2 text-sm transition-colors hover:border-volt hover:text-volt md:inline-flex"
          >
           Resume ↓
          </a>
          {/* Phones are always 2D (see the root layout): no mode switch, and no
              sound, since the score belongs to the 3D dive. */}
          <ModeToggle className="[.phone_&]:hidden" />
          <SoundToggle className="[.phone_&]:hidden" />

          <button
            type="button"
            className="relative grid size-11 place-items-center rounded-full border border-line-strong bg-ink/70 backdrop-blur-md md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`absolute h-px w-4 bg-paper transition-transform duration-500 ease-out-expo ${open ? "rotate-45" : "-translate-y-1"}`} />
            <span className={`absolute h-px w-4 bg-paper transition-transform duration-500 ease-out-expo ${open ? "-rotate-45" : "translate-y-1"}`} />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`gutter fixed inset-x-0 top-16 bottom-0 flex flex-col justify-between bg-ink/95 pb-10 pt-8 backdrop-blur-xl transition-[opacity,visibility] duration-500 md:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <ul className="space-y-2">
          {links.map((l, i) => (
            <li key={l.href}>
              <a href={l.href} onClick={go(l.href)} className="display flex items-baseline gap-4 py-2.5 text-4xl">
                <span className="font-mono text-xs tracking-normal text-volt">0{i + 1}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-paper-dim">
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
          <a href={site.resume} download className="text-volt">
           Resume ↓
          </a>
        </div>
      </div>
    </header>
  );
}
