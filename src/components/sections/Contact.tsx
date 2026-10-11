"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { gsap, SplitText, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/lib/useReveal";
import { useScrollTo } from "@/components/providers/SmoothScroll";
import { site } from "@/content/site";

export function Contact() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-finale-title]", { type: "chars,lines", mask: "lines", linesClass: "split-line" });
        // Explicit end values: never measure an element that might be mid-transition.
        gsap.fromTo(
          split.chars,
          { yPercent: 120, rotate: 6 },
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.3,
            stagger: 0.02,
            ease: "expo.out",
            scrollTrigger: { trigger: "[data-finale-title]", start: "top 80%", once: true },
          },
        );
        // Backdrop glow rises as the page ends
        gsap.fromTo("[data-glow]", { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } });
        return () => split.revert();
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="contact" aria-labelledby="contact-title" className="relative overflow-hidden border-t border-line bg-ink pt-28 md:pt-40">
      <div aria-hidden data-glow className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_70%_at_50%_100%,rgb(180_255_57/0.16),transparent_70%)]" />

      <div className="gutter relative">
        <p data-reveal="fade" className="eyebrow mb-8">
          <span className="text-volt">Chapter 05</span>, Contact
        </p>
        <h2 id="contact-title" data-finale-title className="display text-[clamp(3.4rem,11vw,12rem)]">
          Let&apos;s build something <span className="font-serif font-normal italic tracking-normal text-volt">real.</span>
        </h2>

        <div className="mt-16 grid gap-16 md:mt-24 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p data-reveal="fade" className="max-w-md text-lg text-paper-dim">
              Open to internships, freelance projects and interesting collaborations, or just a conversation about tech and AI.
            </p>
            <EmailCopy />
            <ul data-reveal="fade" data-stagger className="mt-12 border-t border-line">
              {site.socials.map((s) => (
                <li key={s.label} className="border-b border-line">
                  <a href={s.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between py-4">
                    <span className="text-lg transition-transform duration-500 ease-out-expo group-hover:translate-x-2">{s.label}</span>
                    <span className="flex items-center gap-4 font-mono text-xs text-paper-mute">
                      <span className="hidden sm:inline">{s.handle}</span>
                      <span aria-hidden className="text-base transition-all duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-volt">
                        ↗
                      </span>
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <ContactForm />
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}

function EmailCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };
  return (
    <div data-reveal="fade" className="mt-10">
      <a href={`mailto:${site.email}`} className="group inline-block break-all text-[clamp(1.4rem,2.6vw,2.2rem)] font-medium">
        {site.email}
        <span className="mt-1 block h-px w-full origin-left scale-x-[0.25] bg-volt transition-transform duration-700 ease-out-expo group-hover:scale-x-100" />
      </a>
      <button type="button" onClick={copy} className="eyebrow mt-4 block transition-colors hover:text-volt" aria-live="polite">
        {copied ? "Copied ✓" : "Copy address"}
      </button>
    </div>
  );
}

type Status = "idle" | "sending" | "sent" | "error";

function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(site.formspree, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const field =
    "peer w-full border-b border-line-strong bg-transparent pb-3 pt-6 text-lg text-paper outline-none transition-colors placeholder:text-transparent focus:border-volt";
  const label =
    "pointer-events-none absolute left-0 top-6 origin-left text-paper-mute transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-volt peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75";

  return (
    <form data-reveal="fade" onSubmit={onSubmit} noValidate className="space-y-6" aria-describedby="form-status">
      <input type="hidden" name="_subject" value="New portfolio contact" />
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="relative">
          <input id="cf-name" name="name" required autoComplete="name" placeholder="Name" className={field} />
          <label htmlFor="cf-name" className={label}>Your name</label>
        </div>
        <div className="relative">
          <input id="cf-email" name="email" type="email" required autoComplete="email" placeholder="Email" className={field} />
          <label htmlFor="cf-email" className={label}>Email</label>
        </div>
      </div>
      <div className="relative">
        <input id="cf-subject" name="subject" required placeholder="Subject" className={field} />
        <label htmlFor="cf-subject" className={label}>Subject</label>
      </div>
      <div className="relative">
        <textarea id="cf-message" name="message" required rows={4} placeholder="Message" className={`${field} resize-none`} />
        <label htmlFor="cf-message" className={label}>Tell me about your project</label>
      </div>
      {/* honeypot */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="flex flex-wrap items-center gap-6 pt-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex items-center gap-3 rounded-full bg-paper px-7 py-4 font-medium text-ink transition-colors hover:bg-volt disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
          <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
        </button>
        <p id="form-status" role="status" aria-live="polite" className="text-sm">
          {status === "sent" && <span className="text-volt">Thanks, your message is on its way. I&apos;ll reply soon.</span>}
          {status === "error" && (
            <span className="text-[#ff8a7a]">
              Something went wrong. Please email me directly at {site.email}.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}

const clockFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.timezone });
const lahoreTime = () => clockFmt.format(new Date());
const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
};

function Footer() {
  const scrollTo = useScrollTo();
  const time = useSyncExternalStore(subscribeMinute, lahoreTime, () => null);
  const year = useSyncExternalStore(subscribeMinute, () => new Date().getFullYear(), () => null);

  return (
    <footer className="gutter relative mt-28 border-t border-line py-8 md:mt-40">
      <div className="flex flex-col gap-6 text-sm text-paper-mute md:flex-row md:items-center md:justify-between">
        <div>
          <p>
            © {year ?? ""} {site.name}. Designed &amp; built from scratch.
          </p>
          <p className="mt-1 text-xs">
            3D hand:{" "}
            <a href="https://sketchfab.com/3d-models/skeleton-hand-a4bf7eabaca24985b3aa2dbfc2d369ca" target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-paper hover:underline">
              “Skeleton Hand”
            </a>{" "}
            by{" "}
            <a href="https://sketchfab.com/zachariah.the.hale" target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-paper hover:underline">
              Zachariah Hale
            </a>
            ,{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-paper hover:underline">
              CC BY 4.0
            </a>{" "}
            (modified)
          </p>
        </div>
        <p className="font-mono text-xs">
          Lahore <span className="text-paper">{time ?? "--:--"}</span> PKT
        </p>
        <button
          type="button"
          onClick={() => scrollTo(0)}
          className="group inline-flex items-center gap-2 self-start text-paper transition-colors hover:text-volt md:self-auto"
        >
          Back to top
          <span aria-hidden className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-1">↑</span>
        </button>
      </div>
    </footer>
  );
}
