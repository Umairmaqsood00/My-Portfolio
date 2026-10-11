"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE, RINGS } from "./descent";

/**
 * Instrument-style hoops modelled in Blender: a bright core band (the only part
 * bright enough to bloom), plus a dim layer of graduated ticks, a broken outer
 * hairline and a dashed inner one that drifts against the core.
 */
const MODEL = "/models/ring.glb";
useGLTF.preload(MODEL);

/** The detail layer's brightness relative to the core — kept under the bloom threshold. */
const DETAIL = 0.32;

export type RingsHandle = {
  /** `stage` = rings already passed; flashes the one just crossed */
  update: (stage: number, dt: number, time: number) => void;
};

/** Thin glowing hoops the orb falls through. Each wears the colour it will give the orb. */
export const Rings = forwardRef<RingsHandle>(function Rings(_, ref) {
  const { nodes } = useGLTF(MODEL);
  const core = (nodes.ringCore as THREE.Mesh).geometry;
  const detail = (nodes.ringDetail as THREE.Mesh).geometry;

  const groups = useRef<THREE.Group[]>([]);
  const flash = useRef(RINGS.map(() => 0));
  const passed = useRef(0);
  const colors = useMemo(() => RINGS.map((_, i) => new THREE.Color(PALETTE[i + 1].a).lerp(new THREE.Color("#ffffff"), 0.35)), []);
  const tilts = useMemo(() => RINGS.map((_, i) => [Math.PI / 2 + (i % 2 ? 0.16 : -0.12), 0, i * 0.7] as const), []);
  const materials = useMemo(
    () =>
      RINGS.map(() => ({
        core: new THREE.MeshBasicMaterial({ toneMapped: false }),
        detail: new THREE.MeshBasicMaterial({ toneMapped: false }),
      })),
    [],
  );

  useImperativeHandle(ref, () => ({
    update(stage, dt, time) {
      if (stage > passed.current) flash.current[stage - 1] = 1;
      passed.current = stage;
      groups.current.forEach((group, i) => {
        if (!group) return;
        flash.current[i] = Math.max(0, flash.current[i] - dt * 1.4);
        const f = flash.current[i];
        const base = i < stage ? 0.9 : 2.4;
        materials[i].core.color.copy(colors[i]).multiplyScalar(base + f * 7);
        materials[i].detail.color.copy(colors[i]).multiplyScalar(base * DETAIL + f * 2);
        group.scale.setScalar(1 + f * 0.18);
        group.rotation.z = tilts[i][2] + time * 0.05;
        // The tick layer counter-rotates, so the ring reads as a working instrument.
        group.children[1].rotation.z = -time * 0.09 - f * 0.6;
      });
    },
  }));

  return (
    <>
      {RINGS.map((y, i) => (
        <group
          key={y}
          ref={(g) => {
            if (g) groups.current[i] = g;
          }}
          position={[0, y, 0]}
          rotation={[tilts[i][0], tilts[i][1], tilts[i][2]]}
        >
          <mesh geometry={core} material={materials[i].core} />
          <mesh geometry={detail} material={materials[i].detail} />
        </group>
      ))}
    </>
  );
});
