"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { StageState } from "./stageState";
import { makeBadgeTexture, makeBoardTexture, makeGlowTexture, makeScreenTexture } from "./textures";

// Dimensions (world units)
const W = 3.2;
const D = 2.2;
const LID_H = 2.08;
const HINGE: [number, number, number] = [0, 0.165, -D / 2 + 0.03];
const LID_CLOSED = Math.PI / 2;
const LID_OPEN = -0.26;

const VOLT = new THREE.Color("#b4ff39");

type PartKey = "bottom" | "battery" | "board" | "ssd" | "cpu" | "deck" | "keys" | "lid";

/** Exploded-view choreography: where each part travels and when it leaves. */
const PARTS: Record<PartKey, { offset: [number, number, number]; delay: number }> = {
  bottom: { offset: [0, -0.95, 0], delay: 0.0 },
  lid: { offset: [0, 0.7, -0.6], delay: 0.04 },
  battery: { offset: [0, 0.38, 0.15], delay: 0.1 },
  board: { offset: [0, 0.88, 0], delay: 0.16 },
  ssd: { offset: [2.2, 1.15, 0.9], delay: 0.22 },
  cpu: { offset: [-2.15, 1.55, 0.7], delay: 0.25 },
  deck: { offset: [0, 2.0, 0.1], delay: 0.31 },
  keys: { offset: [0, 2.55, 0.1], delay: 0.37 },
};

/** Assembled positions. */
const BASE: Record<PartKey, [number, number, number]> = {
  bottom: [0, 0.012, 0],
  battery: [0, 0.07, 0.45],
  board: [0, 0.09, -0.48],
  ssd: [-0.2, 0.12, -0.12],
  cpu: [-0.75, 0.12, -0.55],
  deck: [0, 0.157, 0],
  keys: [0, 0.185, 0],
  lid: HINGE,
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = THREE.MathUtils.lerp;

export function Laptop({ state }: { state: StageState }) {
  const tex = useMemo(
    () => ({ screen: makeScreenTexture(), board: makeBoardTexture(), badge: makeBadgeTexture(), glow: makeGlowTexture() }),
    [],
  );
  useEffect(() => () => Object.values(tex).forEach((t) => t.dispose()), [tex]);

  const root = useRef<THREE.Group>(null);
  const lidPivot = useRef<THREE.Group>(null);
  const panel = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const parts = useRef<Partial<Record<PartKey, THREE.Group | null>>>({});
  const mats = useRef<{
    screen?: THREE.MeshBasicMaterial | null;
    board?: THREE.MeshStandardMaterial | null;
    ssd?: THREE.MeshStandardMaterial | null;
    cpu?: THREE.MeshStandardMaterial | null;
    keys?: THREE.MeshStandardMaterial | null;
  }>({});
  const smooth = useRef({ px: 0, py: 0 });

  // Keyboard layout as instances: 5 rows × 13 keys + a spacebar row
  const keysRef = useRef<THREE.InstancedMesh>(null);
  const keyMatrices = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    const pitch = 0.212;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 13; c++) {
        out.push(new THREE.Matrix4().makeTranslation((c - 6) * pitch, 0, -0.86 + r * 0.2));
      }
    }
    [-5.5, -4.5, -3.5, 3.5, 4.5, 5.5].forEach((c) =>
      out.push(new THREE.Matrix4().makeTranslation(c * pitch, 0, -0.86 + 5 * 0.2)),
    );
    return out;
  }, []);
  useLayoutEffect(() => {
    const mesh = keysRef.current;
    if (!mesh) return;
    keyMatrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
  }, [keyMatrices]);

  useFrame((three, delta) => {
    const g = root.current;
    if (!g) return;
    const { size } = three;
    const vp = three.viewport.getCurrentViewport(three.camera, [0, 0, 0]);
    const wide = size.width >= 900;

    const intro = ease(clamp01(state.intro));
    const center = ease(clamp01(state.center));
    const explode = clamp01(state.explode);
    const orbit = ease(clamp01(state.orbit));
    const exit = ease(clamp01(state.exit));

    // Pointer parallax, damped so it never feels twitchy
    const s = smooth.current;
    s.px = THREE.MathUtils.damp(s.px, state.pointer.x, 3, delta);
    s.py = THREE.MathUtils.damp(s.py, state.pointer.y, 3, delta);

    // Composition: hero → centred story → exit
    const scale = wide ? Math.min(1, vp.height / 5.4) : Math.min(0.8, (vp.width * 0.72) / W);
    const heroX = wide ? vp.width * 0.2 : 0;
    const heroY = wide ? -0.35 : vp.height * 0.08;
    const storyX = wide ? vp.width * 0.13 : 0;
    const storyY = wide ? 0 : vp.height * 0.2;
    const explodeEased = ease(explode);

    // The exploded stack is ~2x taller than the laptop, so pull back while it's apart.
    const fit = scale * lerp(1, 0.7, explodeEased);

    g.position.x = lerp(heroX, storyX, center);
    g.position.y =
      lerp(heroY, storyY, center) +
      lerp(-0.25, -1.05, explodeEased) * fit +
      lerp(-0.6, 0, intro) +
      exit * vp.height * 0.55 +
      Math.sin(three.clock.elapsedTime * 0.8) * 0.035;
    g.scale.setScalar(fit * lerp(0.88, 1, intro) * lerp(1, 0.78, exit));

    g.rotation.y = lerp(-0.62, -0.95, orbit) + lerp(-0.5, 0, intro) + s.px * 0.22;
    g.rotation.x = lerp(0.1, 0.38, orbit) + s.py * 0.08;
    g.rotation.z = lerp(0, 0.04, orbit);

    // Exploded view: every part follows its own staggered curve
    (Object.keys(PARTS) as PartKey[]).forEach((key) => {
      const part = parts.current[key];
      if (!part) return;
      const [ox, oy, oz] = BASE[key];
      const { offset, delay } = PARTS[key];
      const t = ease(clamp01((explode - delay) / 0.6));
      part.position.set(ox + offset[0] * t, oy + offset[1] * t, oz + offset[2] * t);
      if (key === "ssd" || key === "cpu") part.scale.setScalar(1 + t * 1.2);
    });

    if (lidPivot.current) {
      lidPivot.current.rotation.x = lerp(LID_CLOSED, LID_OPEN, intro) - explodeEased * 0.22;
    }
    if (panel.current) panel.current.position.z = 0.03 + ease(clamp01((explode - 0.28) / 0.5)) * 0.42;

    // Layer highlights
    const { interface: fi, logic: fl, storage: fs, compute: fc } = state.focus;
    const m = mats.current;
    if (m.screen) m.screen.color.setScalar(lerp(0.15, 1, intro) * (1 + fi * 0.35));
    if (m.keys) m.keys.emissiveIntensity = fi * 0.35;
    if (m.board) m.board.emissiveIntensity = 0.25 + fl * 2.4;
    if (m.ssd) m.ssd.emissiveIntensity = fs * 2.2;
    if (m.cpu) m.cpu.emissiveIntensity = 0.08 + fc * 2.2;
    if (glow.current) {
      const gm = glow.current.material as THREE.MeshBasicMaterial;
      gm.opacity = intro * (0.35 + explodeEased * 0.45) * (1 - exit);
      glow.current.position.y = -0.95 * explodeEased - 0.02;
    }
  });

  return (
    <group ref={root}>
      {/* floor glow */}
      <mesh ref={glow} rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} renderOrder={-1}>
        <planeGeometry args={[7, 7]} />
        <meshBasicMaterial map={tex.glow} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Bottom plate */}
      <group ref={(g) => void (parts.current.bottom = g)} position={BASE.bottom}>
        <RoundedBox args={[W, 0.024, D]} radius={0.012} smoothness={2}>
          <meshStandardMaterial color="#202321" metalness={0.85} roughness={0.38} />
        </RoundedBox>
        {[-1.2, 1.2].map((x) =>
          [-0.85, 0.85].map((z) => (
            <mesh key={`${x}${z}`} position={[x, -0.016, z]}>
              <cylinderGeometry args={[0.06, 0.06, 0.012, 16]} />
              <meshStandardMaterial color="#0c0d0c" roughness={0.9} />
            </mesh>
          )),
        )}
      </group>

      {/* Chassis tray */}
      <group position={[0, 0.085, 0]}>
        <RoundedBox args={[W, 0.12, D]} radius={0.05} smoothness={3}>
          <meshStandardMaterial color="#2a2d2b" metalness={0.9} roughness={0.3} />
        </RoundedBox>
      </group>

      {/* Battery */}
      <group ref={(g) => void (parts.current.battery = g)} position={BASE.battery}>
        <RoundedBox args={[2.5, 0.07, 0.82]} radius={0.02} smoothness={2}>
          <meshStandardMaterial color="#151715" metalness={0.3} roughness={0.7} />
        </RoundedBox>
        {[-0.84, 0, 0.84].map((x) => (
          <mesh key={x} position={[x, 0.037, 0]}>
            <boxGeometry args={[0.76, 0.004, 0.7]} />
            <meshStandardMaterial color="#1e211e" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Logic board */}
      <group ref={(g) => void (parts.current.board = g)} position={BASE.board}>
        <mesh>
          <boxGeometry args={[2.95, 0.022, 1.05]} />
          <meshStandardMaterial
            ref={(r) => void (mats.current.board = r)}
            map={tex.board}
            emissiveMap={tex.board}
            emissive="#ffffff"
            emissiveIntensity={0.25}
            metalness={0.4}
            roughness={0.55}
          />
        </mesh>
        {/* cooling fan */}
        <group position={[1.05, 0.04, -0.05]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 40]} />
            <meshStandardMaterial color="#121412" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position={[0, 0.027, 0]}>
            <torusGeometry args={[0.3, 0.015, 8, 48]} />
            <meshStandardMaterial color="#3a3d3a" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
        {/* RAM + small chips */}
        {[-0.05, 0.2].map((z) => (
          <mesh key={z} position={[0.3, 0.022, z]}>
            <boxGeometry args={[0.55, 0.02, 0.12]} />
            <meshStandardMaterial color="#1a1d1a" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
        {[
          [-1.15, -0.25],
          [-1.15, 0.2],
          [-0.15, 0.32],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.02, z]}>
            <boxGeometry args={[0.18, 0.018, 0.18]} />
            <meshStandardMaterial color="#111311" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Storage (SSD) */}
      <group ref={(g) => void (parts.current.ssd = g)} position={BASE.ssd}>
        <RoundedBox args={[0.72, 0.03, 0.22]} radius={0.01} smoothness={2}>
          <meshStandardMaterial
            ref={(r) => void (mats.current.ssd = r)}
            color="#1b1e1b"
            emissive={VOLT}
            emissiveIntensity={0}
            metalness={0.5}
            roughness={0.4}
          />
        </RoundedBox>
        <mesh position={[-0.12, 0.017, 0]}>
          <boxGeometry args={[0.3, 0.004, 0.16]} />
          <meshStandardMaterial color="#2d302d" roughness={0.5} />
        </mesh>
      </group>

      {/* Processor */}
      <group ref={(g) => void (parts.current.cpu = g)} position={BASE.cpu}>
        <mesh>
          <boxGeometry args={[0.44, 0.03, 0.44]} />
          <meshStandardMaterial color="#141614" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.3]} />
          <meshStandardMaterial
            ref={(r) => void (mats.current.cpu = r)}
            color="#9a9d97"
            emissive={VOLT}
            emissiveIntensity={0.08}
            metalness={0.95}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Top deck: palm rest, keyboard well, trackpad */}
      <group ref={(g) => void (parts.current.deck = g)} position={BASE.deck}>
        <RoundedBox args={[W - 0.01, 0.022, D - 0.01]} radius={0.01} smoothness={2}>
          <meshStandardMaterial color="#343734" metalness={0.88} roughness={0.32} />
        </RoundedBox>
        <mesh position={[0, 0.0115, -0.36]}>
          <boxGeometry args={[2.86, 0.002, 1.24]} />
          <meshStandardMaterial color="#121412" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.0115, 0.7]}>
          <boxGeometry args={[1.15, 0.002, 0.62]} />
          <meshStandardMaterial color="#2b2e2b" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>

      {/* Keycaps */}
      <group ref={(g) => void (parts.current.keys = g)} position={BASE.keys}>
        <instancedMesh ref={keysRef} args={[undefined, undefined, keyMatrices.length]}>
          <boxGeometry args={[0.18, 0.026, 0.17]} />
          <meshStandardMaterial
            ref={(r) => void (mats.current.keys = r)}
            color="#0f110f"
            emissive={VOLT}
            emissiveIntensity={0}
            roughness={0.65}
          />
        </instancedMesh>
        <mesh position={[0, 0, -0.86 + 5 * 0.2]}>
          <boxGeometry args={[1.05, 0.026, 0.17]} />
          <meshStandardMaterial color="#0f110f" roughness={0.65} />
        </mesh>
      </group>

      {/* Lid: hinge pivot → back cover + display panel */}
      <group ref={(g) => void (parts.current.lid = g)} position={BASE.lid}>
        <group ref={lidPivot} rotation-x={LID_CLOSED}>
          <RoundedBox args={[W, LID_H, 0.05]} radius={0.04} smoothness={3} position={[0, LID_H / 2, -0.02]}>
            <meshStandardMaterial color="#2a2d2b" metalness={0.9} roughness={0.28} />
          </RoundedBox>
          <mesh position={[0, LID_H / 2 + 0.05, -0.047]} rotation-y={Math.PI}>
            <planeGeometry args={[0.42, 0.42]} />
            <meshBasicMaterial map={tex.badge} transparent toneMapped={false} />
          </mesh>
          <group ref={panel} position={[0, 0, 0.03]}>
            <mesh position={[0, LID_H / 2, 0]}>
              <boxGeometry args={[W - 0.06, LID_H - 0.06, 0.016]} />
              <meshStandardMaterial color="#070807" roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[0, LID_H / 2 + 0.02, 0.0085]}>
              <planeGeometry args={[W - 0.22, (W - 0.22) * 0.625]} />
              <meshBasicMaterial ref={(r) => void (mats.current.screen = r)} map={tex.screen} toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
