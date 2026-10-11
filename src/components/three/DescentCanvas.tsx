"use client";

import { Component, Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { ambient } from "@/lib/ambient";
import { HAND, REST_Y, WATER_Y, clamp01, orbFallY, range, smooth, stageAt, type DescentState } from "./descent";
import { Orb, type OrbHandle } from "./Orb";
import { Rings, type RingsHandle } from "./Rings";
import { Rocks } from "./Rocks";
import { Water, type WaterHandle } from "./Water";
import { Hand, type HandHandle } from "./Hand";

type Props = {
  state: DescentState;
  /** Pause rendering entirely when the section is off-screen. */
  active: boolean;
  /** Phones / weak GPUs: one pixel per pixel, no post-processing, no reflections. */
  low?: boolean;
  onReady?: () => void;
  /** The scene can't run here — crashed, lost its GPU context, or too slow to use. */
  onError?: () => void;
};

export default function DescentCanvas({ state, active, low, onReady, onError }: Props) {
  return (
    <CanvasErrorBoundary onError={onError}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={low ? 1 : [1, 1.75]}
        camera={{ position: [0, 0.5, 16], fov: 35, near: 0.1, far: 120 }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          // Phones drop the GL context under memory pressure, leaving a black
          // canvas — hand over to the still orb instead.
          gl.domElement.addEventListener("webglcontextlost", () => onError?.(), { once: true });
          onReady?.();
        }}
        aria-hidden
      >
        <color attach="background" args={["#020203"]} />
        <fog attach="fog" args={["#020203", 14, 42]} />
        <ambientLight intensity={0.05} />
        <directionalLight position={[2, 12, 6]} intensity={1.15} color="#e3e8ff" />
        <directionalLight position={[-6, -2, -5]} intensity={0.35} color="#8c9cff" />

        <Suspense fallback={null}>
          {/* Wet-stone reflections from a few light panels — no HDR download */}
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={1.6} position={[0, 6, 2]} scale={[12, 2, 1]} rotation-x={Math.PI / 2} />
            <Lightformer form="rect" intensity={0.6} color="#aab6ff" position={[-6, 1, 2]} scale={[3, 8, 1]} rotation-y={Math.PI / 2} />
            <Lightformer form="ring" intensity={0.8} position={[4, 2, 6]} scale={3} />
          </Environment>
          <Scene state={state} low={low} onSlow={onError} />
        </Suspense>

        <Sparkles count={low ? 60 : 140} scale={[16, 66, 12]} position={[0, -27, 0]} size={1.6} speed={0.18} opacity={0.4} color="#cfd6ff" />

        {/* Full-screen passes are what phones choke on: skip them there. */}
        {!low && (
          <EffectComposer multisampling={4}>
            {/* High threshold: only the rings and the orb's highlight glow, never its body. */}
            <Bloom mipmapBlur intensity={0.65} luminanceThreshold={0.9} luminanceSmoothing={0.25} />
            <Vignette offset={0.28} darkness={0.78} />
          </EffectComposer>
        )}
      </Canvas>
    </CanvasErrorBoundary>
  );
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

// Scratch objects reused every frame (one scene per page, so module scope is fine).
const tmp = {
  pos: new THREE.Vector3(),
  look: new THREE.Vector3(),
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
  la: new THREE.Vector3(),
  lb: new THREE.Vector3(),
  pointer: new THREE.Vector2(),
};

/** Seconds of sustained sub-12fps rendering before giving up on the 3D scene. */
const SLOW_LIMIT = 2.5;

function Scene({ state, low, onSlow }: { state: DescentState; low?: boolean; onSlow?: () => void }) {
  const orb = useRef<OrbHandle>(null!);
  const rings = useRef<RingsHandle>(null);
  const hand = useRef<HandHandle>(null);
  const water = useRef<WaterHandle>(null!);

  const prev = useRef({ stage: 0, handUp: false, orbUp: true, depth: -1 });
  const slow = useRef({ time: 0, fired: false });

  useFrame(({ camera, clock }, rawDt) => {
    // Watchdog: a GPU this far behind also starves the main thread, so taps stop
    // working. One long frame (shader compile, tab switch) doesn't count.
    const w = slow.current;
    w.time = rawDt > 0.083 ? w.time + Math.min(rawDt, 0.2) : Math.max(0, w.time - rawDt);
    if (w.time > SLOW_LIMIT && !w.fired) {
      w.fired = true;
      onSlow?.();
    }

    const dt = Math.min(rawDt, 0.1);
    const t = state.t;
    const time = clock.elapsedTime;
    const p = prev.current;

    // ── hand timeline ──
    const rise = easeOut(range(HAND.rise, t));
    const open = range(HAND.open, t);
    const grip = range(HAND.grip, t);
    const sink = range(HAND.sink, t);

    // ── orb ──
    const fallY = orbFallY(t);
    const bob = Math.sin(time * 1.1) * 0.08 * (1 - rise);
    const y = fallY + bob - grip * 0.12 - sink * 3.7;
    orb.current.group.position.set(0, y, 0);
    orb.current.group.scale.setScalar(0.7 + 0.3 * state.intro);

    const stage = stageAt(y);
    if (stage > p.stage) ambient.chime(stage);
    p.stage = stage;
    orb.current.update(stage, dt, time, state.intro * (1 - sink * 0.9));
    rings.current?.update(stage, dt, time);

    // ── hand: rises reaching up, levels out under the orb, closes, pulls it under ──
    // (null until its model has loaded — it streams in on its own)
    const h = hand.current;
    if (h) {
      const handOn = t > HAND.rise[0] - 0.05;
      h.setVisible(handOn);
      h.place(orb.current.group.position, rise, Math.max(0.35 * (1 - open), grip), open * (1 - grip));

      const handUp = handOn && h.tipY > WATER_Y;
      if (handUp !== p.handUp) {
        water.current.ripple(h.wrist.x, h.wrist.z, 1);
        if (handUp) ambient.splash(0.8);
      }
      p.handUp = handUp;
    }
    const orbUp = y > WATER_Y;
    if (orbUp !== p.orbUp) {
      water.current.ripple(0, 0, 1.5);
      if (!orbUp) ambient.splash(1);
    }
    p.orbUp = orbUp;
    water.current.group.visible = t > 7.6;

    // ── camera: hero → follow the fall → low over the water ──
    const heroMix = smooth(0.55, 1.7, t);
    const endMix = smooth(8.3, 9.5, t);
    // hero
    tmp.pos.set(0, 0.5, 11 + (1 - state.intro) * 5);
    tmp.look.set(0, 0.45, 0);
    // follow: orbit slowly around the shaft as we descend
    const angle = -0.32 + clamp01(-fallY / 50) * 0.64;
    tmp.a.set(Math.sin(angle) * 10, fallY + 3.4, Math.cos(angle) * 10);
    tmp.la.set(0, fallY - 1.4, 0);
    // bottom
    tmp.b.set(1.1, WATER_Y + 1.7 - sink * 0.5, 10.5);
    tmp.lb.set(0, REST_Y + 0.9 - sink * 1.2, 0);

    tmp.pos.lerp(tmp.a, heroMix).lerp(tmp.b, endMix);
    tmp.look.lerp(tmp.la, heroMix).lerp(tmp.lb, endMix);

    tmp.pointer.lerp(state.pointer as THREE.Vector2Like, 1 - Math.exp(-dt * 2.5));
    tmp.pos.x += tmp.pointer.x * 0.45;
    tmp.pos.y -= tmp.pointer.y * 0.25;

    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.look);

    // The score darkens as you dive.
    const depth = Math.round(clamp01(-fallY / (REST_Y * -1)) * 50) / 50;
    if (depth !== p.depth) ambient.setDepth(depth);
    p.depth = depth;
  });

  return (
    <>
      <Orb ref={orb} />
      {/* Each model gets its own boundary: the orb never waits on a download. */}
      <Suspense fallback={null}>
        <Rings ref={rings} />
      </Suspense>
      <Suspense fallback={null}>
        <Rocks low={low} />
      </Suspense>
      <Suspense fallback={null}>
        <Hand ref={hand} />
      </Suspense>
      <Water ref={water} low={low} />
    </>
  );
}

class CanvasErrorBoundary extends Component<{ children: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
