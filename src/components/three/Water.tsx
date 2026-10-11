"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { WATER_Y } from "./descent";

export type WaterHandle = {
  group: THREE.Group;
  /** start an expanding ripple at (x, z) */
  ripple: (x: number, z: number, strength?: number) => void;
};

const RIPPLES = 6;

/** Smooth tiling noise for the reflection's slow wobble. */
function noiseTexture(size = 128) {
  const data = new Uint8Array(size * size * 4);
  const waves = Array.from({ length: 6 }, (_, i) => ({ fx: 1 + (i % 3), fy: 1 + ((i * 2) % 3), ph: i * 1.7 }));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      for (const w of waves) v += Math.sin(((x * w.fx + y * w.fy) / size) * Math.PI * 2 + w.ph);
      const c = Math.round((v / waves.length) * 0.5 * 255 + 127);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = c;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.needsUpdate = true;
  return tex;
}

/** Black mirror water with expanding ripple rings. Only renders near the bottom. */
export const Water = forwardRef<WaterHandle, { low?: boolean }>(function Water({ low }, ref) {
  const distortion = useMemo(() => noiseTexture(), []);
  const rings = useRef<THREE.Mesh[]>([]);
  const slots = useRef(Array.from({ length: RIPPLES }, () => ({ start: -10, strength: 1 })));
  const next = useRef(0);
  const clock = useRef(0);
  const group = useRef<THREE.Group>(null!);

  useImperativeHandle(ref, () => ({
    get group() {
      return group.current;
    },
    ripple(x, z, strength = 1) {
      // Three staggered rings per disturbance.
      for (let k = 0; k < 3; k++) {
        const i = next.current;
        next.current = (next.current + 1) % RIPPLES;
        slots.current[i] = { start: clock.current + k * 0.28, strength };
        rings.current[i]?.position.set(x, WATER_Y + 0.02, z);
      }
    },
  }));

  useFrame((_, dt) => {
    clock.current += dt;
    distortion.offset.x += dt * 0.012;
    distortion.offset.y += dt * 0.007;
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const { start, strength } = slots.current[i];
      const age = clock.current - start;
      const life = 2.8;
      const on = age >= 0 && age < life;
      ring.visible = on;
      if (!on) return;
      const p = age / life;
      ring.scale.setScalar(0.4 + p * 5 * strength);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - p) * (1 - p) * 0.35 * strength;
    });
  });

  return (
    <group ref={group} visible={false}>
      <mesh rotation-x={-Math.PI / 2} position={[0, WATER_Y, 0]}>
        <planeGeometry args={[80, 80]} />
        {/* The reflector re-renders the whole scene every frame: phones get plain black water. */}
        {low ? (
          <meshStandardMaterial color="#030304" metalness={0.6} roughness={0.35} envMapIntensity={0.4} />
        ) : (
          <MeshReflectorMaterial
            resolution={512}
            blur={[300, 100]}
            mixBlur={1}
            mixStrength={60}
            mixContrast={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            distortion={0.2}
            distortionMap={distortion}
            color="#030304"
            metalness={0.5}
            roughness={1}
            envMapIntensity={0}
          />
        )}
      </mesh>
      {Array.from({ length: RIPPLES }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) rings.current[i] = m;
          }}
          rotation-x={-Math.PI / 2}
          visible={false}
        >
          <ringGeometry args={[0.96, 1, 96]} />
          <meshBasicMaterial color="#dfe6ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
});
