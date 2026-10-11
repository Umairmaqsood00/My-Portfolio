import Image from "next/image";
import type { Project } from "@/content/projects";

/*
 * Each visual is a system diagram built from the project's real description —
 * or, where the product is live, a real screenshot. Elements marked
 * data-node / data-flow / data-pop are animated by <Projects />.
 */

const Node = ({ label, sub, accent = false }: { label: string; sub?: string; accent?: boolean }) => (
  <div
    data-node
    className={`relative rounded-xl border px-4 py-3 backdrop-blur-sm ${accent ? "border-volt/60 bg-volt/[0.07]" : "border-line-strong bg-ink-2/80"}`}
  >
    <p className={`text-sm font-medium ${accent ? "text-volt" : "text-paper"}`}>{label}</p>
    {sub && <p className="mt-0.5 font-mono text-[0.68rem] text-paper-mute">{sub}</p>}
  </div>
);

function RagVisual() {
  const steps = [
    { label: "Course materials", sub: "PDFs · past exams" },
    { label: "Embeddings", sub: "SentenceTransformer" },
    { label: "Vector search", sub: "Qdrant · course + doc-type filters" },
    { label: "RAG generation", sub: "LangChain · Groq LLM" },
    { label: "Custom exam", sub: "FastAPI · PDF export", accent: true },
  ];
  return (
    <div className="relative grid h-full grid-cols-[auto_1fr] gap-x-5 p-6 md:p-10">
      <div className="relative w-px bg-line-strong">
        <span data-flow className="absolute left-1/2 top-0 h-16 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-volt to-transparent" />
      </div>
      <div className="flex flex-col justify-between gap-3">
        {steps.map((s) => (
          <Node key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}

function ResumeVisual({ stat }: { stat?: Project["stat"] }) {
  return (
    <div className="relative grid h-full grid-cols-[0.8fr_1fr] items-center gap-5 p-6 md:gap-8 md:p-10">
      {/* two-column PDF page */}
      <div data-node className="aspect-[3/4] rounded-lg border border-line-strong bg-paper/[0.04] p-4">
        <div className="mb-4 h-2.5 w-2/3 rounded bg-paper/30" />
        <div className="grid grid-cols-[1fr_1.6fr] gap-3">
          {[0, 1].map((col) => (
            <div key={col} className="space-y-1.5">
              {Array.from({ length: col ? 11 : 8 }).map((_, i) => (
                <div key={i} className="h-1.5 rounded bg-paper/15" style={{ width: `${55 + ((i * 37 + col * 13) % 45)}%` }} />
              ))}
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-[0.6rem] text-paper-mute">resume.pdf</p>
      </div>
      <div className="space-y-4">
        <pre data-node className="overflow-hidden rounded-lg border border-line-strong bg-ink-2/90 p-4 font-mono text-[0.7rem] leading-relaxed text-paper-dim">
          <span className="text-paper-mute">{"{"}</span>
          {"\n  "}<span className="text-paper">&quot;name&quot;</span>: <span className="text-volt">…</span>,
          {"\n  "}<span className="text-paper">&quot;contact&quot;</span>: <span className="text-volt">…</span>,
          {"\n  "}<span className="text-paper">&quot;skills&quot;</span>: [<span className="text-volt">…</span>],
          {"\n  "}<span className="text-paper">&quot;experience&quot;</span>: [<span className="text-volt">…</span>],
          {"\n  "}<span className="text-paper">&quot;education&quot;</span>: [<span className="text-volt">…</span>]
          {"\n"}<span className="text-paper-mute">{"}"}</span>
        </pre>
        {stat && (
          <div data-pop className="rounded-lg border border-volt/50 bg-volt/[0.07] p-4">
            <p className="display text-5xl text-volt">{stat.value}</p>
            <p className="eyebrow mt-2 text-paper-dim">{stat.label} · DistilBERT + rules</p>
          </div>
        )}
      </div>
      <span data-flow className="pointer-events-none absolute left-[44%] top-1/2 h-[3px] w-14 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-volt to-transparent" />
    </div>
  );
}

const ModuleRow = ({ items, up }: { items: string[]; up?: boolean }) => (
  <div className="grid grid-cols-3 gap-3">
    {items.map((m) => (
      <div key={m} className={`flex items-center ${up ? "flex-col-reverse" : "flex-col"}`}>
        <div data-node className="w-full rounded-xl border border-line-strong bg-ink-2/80 px-3 py-3 text-center text-xs font-medium text-paper md:text-sm">
          {m}
        </div>
        <span aria-hidden className={`h-6 w-px from-line-strong to-volt/60 md:h-10 ${up ? "bg-gradient-to-t" : "bg-gradient-to-b"}`} />
      </div>
    ))}
  </div>
);

function PlatformVisual() {
  const top = ["Subscriptions", "Practice tests", "Role dashboards"];
  const bottom = ["Essay review", "Payments", "University match"];
  return (
    <div className="relative flex h-full flex-col justify-center p-6 md:p-10">
      <ModuleRow items={top} />
      <div data-pop className="relative overflow-hidden rounded-xl border border-volt/60 bg-volt/[0.07] px-4 py-5 text-center">
        <span data-flow className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-volt/25 to-transparent" />
        <p className="relative font-medium text-volt">REST API · role-based auth</p>
        <p className="relative mt-1 font-mono text-[0.68rem] text-paper-mute">Node.js · Express.js · MongoDB</p>
      </div>
      <ModuleRow items={bottom} up />
      <p data-node className="mt-6 text-center font-mono text-[0.68rem] text-paper-mute">React.js client → one API → six modules</p>
    </div>
  );
}

function TestVisual() {
  const choices = ["A", "B", "C", "D"];
  return (
    <div className="relative flex h-full items-center justify-center gap-6 p-6 md:p-10">
      {/* Bluebook-style test window */}
      <div data-node className="relative w-full max-w-[22rem] overflow-hidden rounded-xl border border-line-strong bg-ink-2/90 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <p className="font-mono text-[0.6rem] uppercase tracking-widest text-paper-mute">Math · Module 1</p>
          <p data-pop className="rounded-full border border-volt/60 px-2 py-0.5 font-mono text-[0.65rem] text-volt">31:42</p>
        </div>
        <div className="space-y-2 px-4 pt-4">
          <span className="inline-grid size-5 place-items-center rounded bg-paper font-mono text-[0.6rem] text-ink">12</span>
          {[0.92, 0.78, 0.55].map((w, i) => (
            <div key={i} className="h-1.5 rounded bg-paper/20" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
        <div className="space-y-2 p-4">
          {choices.map((c, i) => (
            <div key={c} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${i === 2 ? "border-volt/60 bg-volt/[0.07]" : "border-line"}`}>
              <span className={`grid size-5 place-items-center rounded-full border font-mono text-[0.6rem] ${i === 2 ? "border-volt text-volt" : "border-paper/30 text-paper-mute"}`}>{c}</span>
              <span className="h-1.5 rounded bg-paper/20" style={{ width: `${[48, 62, 40, 56][i]}%` }} />
            </div>
          ))}
        </div>
        <div className="relative h-1 bg-line">
          <span data-flow className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-volt to-transparent" />
        </div>
      </div>
      <div className="hidden max-w-[11rem] space-y-3 sm:block">
        <Node label="9,927 questions" sub="real past papers" accent />
        <Node label="Timed test screen" sub="scoring · review" />
        <Node label="Playwright pipeline" sub="scrape · parse · validate" />
      </div>
    </div>
  );
}

function MobileVisual() {
  return (
    <div className="relative flex h-full items-center justify-center gap-6 p-6 md:p-10">
      <div data-node className="relative aspect-[9/19] h-[88%] rounded-[2rem] border border-line-strong bg-ink-2 p-3 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-paper/15" />
        <p className="px-2 font-mono text-[0.6rem] text-paper-mute">GROUP</p>
        <div className="mx-2 mt-1 h-3 w-2/3 rounded bg-paper/30" />
        <div data-pop className="mx-1 mt-4 rounded-2xl bg-volt p-3 text-volt-ink">
          <p className="font-mono text-[0.55rem] uppercase tracking-widest opacity-70">Balances</p>
          <div className="mt-2 h-4 w-1/2 rounded bg-volt-ink/80" />
        </div>
        <div className="mt-3 space-y-2 px-1">
          {[0.72, 0.5, 0.64, 0.42].map((w, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-line px-2 py-2">
              <span className="size-5 shrink-0 rounded-full bg-paper/15" />
              <span className="h-1.5 rounded bg-paper/20" style={{ width: `${w * 100}%` }} />
              <span className={`ml-auto h-1.5 w-6 rounded ${i % 2 ? "bg-volt/70" : "bg-paper/30"}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden max-w-[11rem] space-y-3 sm:block">
        <Node label="Add expense" sub="who paid · who shares" />
        <Node label="Auto-balance" sub="who owes whom" accent />
        <Node label="React Native" sub="iOS + Android" />
      </div>
    </div>
  );
}

function ScreenshotVisual({ image, title }: { image: NonNullable<Project["image"]>; title: string }) {
  return (
    <div className="relative h-full p-4 md:p-8">
      <div data-node className="relative h-full overflow-hidden rounded-lg border border-line-strong shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
        <div className="flex h-7 items-center gap-1.5 border-b border-line bg-ink-2 px-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 rounded-full bg-paper/20" />
          ))}
          <span className="ml-3 font-mono text-[0.6rem] text-paper-mute">{title.toLowerCase()}, live</span>
        </div>
        <div className="relative h-[calc(100%-1.75rem)]">
          <Image data-parallax src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 55vw, 92vw" className="scale-110 object-cover object-top" />
        </div>
      </div>
    </div>
  );
}

export function ProjectVisual({ project }: { project: Project }) {
  if (project.image) return <ScreenshotVisual image={project.image} title={project.title} />;
  switch (project.visual) {
    case "rag":
      return <RagVisual />;
    case "resume":
      return <ResumeVisual stat={project.stat} />;
    case "platform":
      return <PlatformVisual />;
    case "mobile":
      return <MobileVisual />;
    case "test":
      return <TestVisual />;
    default:
      return null;
  }
}
