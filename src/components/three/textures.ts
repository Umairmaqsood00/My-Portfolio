import * as THREE from "three";

const VOLT = "#b4ff39";

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** A code editor on the laptop display. */
export function makeScreenTexture() {
  return canvasTexture(1280, 800, (ctx) => {
    ctx.fillStyle = "#0b0d0b";
    ctx.fillRect(0, 0, 1280, 800);

    // title bar + tabs
    ctx.fillStyle = "#131613";
    ctx.fillRect(0, 0, 1280, 52);
    ["#3a3d3a", "#3a3d3a", "#3a3d3a"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(30 + i * 24, 26, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.font = "500 20px ui-monospace, Consolas, monospace";
    ctx.fillStyle = "#0b0d0b";
    ctx.fillRect(120, 10, 220, 42);
    ctx.fillStyle = "#ecece4";
    ctx.fillText("portfolio.ts", 146, 38);
    ctx.fillStyle = "#6c6f67";
    ctx.fillText("rag/pipeline.py", 380, 38);
    ctx.fillStyle = VOLT;
    ctx.fillRect(120, 50, 220, 2);

    // gutter
    ctx.fillStyle = "#0f110f";
    ctx.fillRect(0, 52, 70, 748);

    type Tok = [string, string];
    const K = "#c792ea", S = VOLT, P = "#ecece4", M = "#6c6f67", F = "#82aaff", N = "#f78c6c";
    const lines: Tok[][] = [
      [["// one developer, the whole stack", M]],
      [["const ", K], ["umair", F], [" = {", P]],
      [["  role", P], [": ", P], ['"Full-Stack & AI Developer"', S], [",", P]],
      [["  base", P], [": ", P], ['"Lahore, PK"', S], [",", P]],
      [["  interface", P], [": [", P], ['"React"', S], [", ", P], ['"Next.js"', S], [", ", P], ['"React Native"', S], ["],", P]],
      [["  logic", P], [": [", P], ['"Node.js"', S], [", ", P], ['"Express"', S], [", ", P], ['"FastAPI"', S], ["],", P]],
      [["  data", P], [": [", P], ['"MongoDB"', S], [", ", P], ['"PostgreSQL"', S], [", ", P], ['"Qdrant"', S], ["],", P]],
      [["  intelligence", P], [": [", P], ['"LangChain"', S], [", ", P], ['"RAG"', S], [", ", P], ['"LLMs"', S], ["],", P]],
      [["};", P]],
      [],
      [["export default ", K], ["ship", F], ["(umair, { ", P], ["quality", P], [": ", P], ["100", N], [" });", P]],
      [],
      [["// → build ready", M]],
    ];
    ctx.font = "500 25px ui-monospace, Consolas, monospace";
    lines.forEach((toks, i) => {
      const y = 112 + i * 44;
      ctx.fillStyle = "#3a3d3a";
      ctx.fillText(String(i + 1).padStart(2, " "), 18, y);
      let x = 100;
      toks.forEach(([t, c]) => {
        ctx.fillStyle = c;
        ctx.fillText(t, x, y);
        x += ctx.measureText(t).width;
      });
    });
    // cursor
    ctx.fillStyle = VOLT;
    ctx.fillRect(100 + ctx.measureText("// → build ready").width + 6, 112 + 12 * 44 - 22, 13, 28);

    // status bar
    ctx.fillStyle = "#131613";
    ctx.fillRect(0, 768, 1280, 32);
    ctx.font = "500 17px ui-monospace, Consolas, monospace";
    ctx.fillStyle = VOLT;
    ctx.fillText("● main", 20, 790);
    ctx.fillStyle = "#6c6f67";
    ctx.fillText("TypeScript   UTF-8   Ln 13, Col 18", 980, 790);
  });
}

/** Circuit traces for the logic board. Deterministic so it never flickers between renders. */
export function makeBoardTexture() {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return canvasTexture(1024, 384, (ctx) => {
    ctx.fillStyle = "#0a120a";
    ctx.fillRect(0, 0, 1024, 384);
    ctx.lineCap = "round";
    for (let i = 0; i < 90; i++) {
      let x = rand() * 1024;
      let y = rand() * 384;
      ctx.strokeStyle = rand() > 0.75 ? VOLT : "#2f4a1c";
      ctx.globalAlpha = 0.35 + rand() * 0.5;
      ctx.lineWidth = rand() > 0.8 ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 4; s++) {
        if (s % 2 === 0) x += (rand() - 0.5) * 260;
        else y += (rand() - 0.5) * 160;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

/** Lid badge. */
export function makeBadgeTexture() {
  return canvasTexture(256, 256, (ctx) => {
    ctx.clearRect(0, 0, 256, 256);
    ctx.strokeStyle = VOLT;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = VOLT;
    ctx.font = "600 92px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("UM", 128, 134);
  });
}

/** Soft radial glow for the floor. */
export function makeGlowTexture() {
  return canvasTexture(256, 256, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(180,255,57,0.55)");
    g.addColorStop(0.45, "rgba(180,255,57,0.12)");
    g.addColorStop(1, "rgba(180,255,57,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  });
}
