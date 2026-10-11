"use client";

import { useSyncExternalStore } from "react";
import { isStill, setMode, type Mode } from "@/lib/motion";

const noopSubscribe = () => () => {};
const OPTIONS: { mode: Mode; label: string; title: string; active: string }[] = [
  { mode: "2d", label: "2D", title: "2D, a static page with no animation", active: "still:bg-paper still:text-ink" },
  { mode: "3d", label: "3D", title: "3D, the scroll-driven dive", active: "[:root:not(.still)_&]:bg-paper [:root:not(.still)_&]:text-ink" },
];

/**
 * 2D / 3D switch. The highlighted half comes from the `.still` class in CSS,
 * so it's right on first paint; aria-pressed follows once hydrated.
 */
export function ModeToggle({ className = "" }: { className?: string }) {
  const mode = useSyncExternalStore(noopSubscribe, () => (isStill() ? "2d" : "3d"), () => null);

  return (
    <div
      role="group"
      aria-label="Display mode"
      className={`flex h-11 items-center rounded-full border border-line-strong bg-ink/70 p-1 backdrop-blur-md md:h-10 ${className}`}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.mode}
          type="button"
          title={o.title}
          aria-pressed={mode === null ? undefined : mode === o.mode}
          onClick={() => mode !== o.mode && setMode(o.mode)}
          className={`h-full rounded-full px-3 font-mono text-[0.7rem] tracking-wider text-paper-dim transition-colors hover:text-paper ${o.active}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
