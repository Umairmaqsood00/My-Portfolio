import { layers } from "@/content/skills";

/**
 * Shown only when WebGL is unavailable. A CSS-3D stack of the same four
 * layers — clearly an illustration, not a pretend 3D model.
 */
export function LayerStackFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center md:justify-end md:pr-[12vw]" aria-hidden>
      <div className="relative h-[46svh] w-[min(70vw,26rem)] [perspective:1200px]">
        {layers.map((l, i) => (
          <div
            key={l.id}
            className="absolute inset-x-0 mx-auto flex h-28 items-center justify-center rounded-2xl border border-line-strong bg-ink-3/80 font-mono text-xs uppercase tracking-[0.2em] text-paper-dim shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] [transform:rotateX(58deg)_rotateZ(-38deg)]"
            style={{ top: `${i * 22}%` }}
          >
            <span className="text-volt">0{i + 1}</span>&nbsp;·&nbsp;{l.title}
          </div>
        ))}
      </div>
    </div>
  );
}
