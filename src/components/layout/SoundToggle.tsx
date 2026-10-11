"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ambient } from "@/lib/ambient";

/** Round sound switch: four bars that breathe while the ambient score plays. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSyncExternalStore(ambient.subscribe, ambient.getSnapshot, () => false);

  // Phones have no sound button (see Nav), so never bring the score back there.
  useEffect(() => (document.documentElement.classList.contains("phone") ? undefined : ambient.restorePreference()), []);

  return (
    <button
      type="button"
      onClick={ambient.toggle}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      title={on ? "Sound off" : "Sound on"}
      className={`group grid size-11 place-items-center rounded-full border border-line-strong bg-ink/70 backdrop-blur-md transition-colors hover:border-paper md:size-10 ${className}`}
    >
      <span aria-hidden className="flex h-3.5 items-center gap-[3px]">
        {[0.9, 0.55, 1, 0.7].map((h, i) => (
          <span
            key={i}
            className={`block w-[2px] origin-center rounded-full bg-paper transition-transform duration-500 ${on ? "animate-[eq_1.1s_ease-in-out_infinite_alternate]" : ""}`}
            style={{ height: "100%", transform: on ? undefined : "scaleY(0.18)", animationDelay: `${i * -0.27}s`, ["--h" as string]: h }}
          />
        ))}
      </span>
    </button>
  );
}
