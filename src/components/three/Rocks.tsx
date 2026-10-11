"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { WATER_Y } from "./descent";

/**
 * Wet black stone lining the shaft and sitting in the water at the bottom.
 * Four rock variants modelled in Blender (split-stone facets, fractures and
 * strata baked into one shared normal map), re-used and scaled per placement.
 */

const MODEL = "/models/rocks.glb";
useGLTF.preload(MODEL);

type Rock = { position: [number, number, number]; scale: [number, number, number]; rotation: [number, number, number]; variant: number };

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function layout(): Rock[] {
  const rand = mulberry32(7);
  const rocks: Rock[] = [];
  const rot = (): [number, number, number] => [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI];

  // Hero framing: two big shoulders either side of the orb.
  rocks.push({ position: [-5.6, -4.4, 2.6], scale: [4.4, 4.0, 3.4], rotation: [0.3, 0.8, 0.2], variant: 0 });
  rocks.push({ position: [5.9, -4.0, 2.0], scale: [4.0, 4.4, 3.2], rotation: [0.1, 2.2, -0.3], variant: 1 });
  rocks.push({ position: [-9.5, -1.5, -4], scale: [3.5, 5, 3], rotation: rot(), variant: 2 });
  rocks.push({ position: [10, -2, -5], scale: [3.8, 5.2, 3], rotation: rot(), variant: 3 });

  // Shaft walls.
  for (let y = -8; y > WATER_Y + 4; y -= 3.1) {
    for (const side of [-1, 1]) {
      const near = rand() > 0.55;
      rocks.push({
        position: [side * (near ? 5 + rand() * 1.5 : 6.5 + rand() * 3), y + rand() * 2, near ? 1 + rand() * 3 : -6 + rand() * 6],
        scale: [1.8 + rand() * 2, 2.4 + rand() * 3, 1.6 + rand() * 2],
        rotation: rot(),
        variant: Math.floor(rand() * 4),
      });
    }
  }

  // Stones in the water behind the orb, and the cave walls at the bottom.
  const pool: [number, number, number, number][] = [
    [-2.3, -1.6, 1.0, 0],
    [2.1, -1.2, 0.9, 1],
    [0.4, -3.0, 1.1, 2],
    [-4.2, -3.5, 1.4, 3],
    [4.6, -2.8, 1.3, 0],
  ];
  pool.forEach(([x, z, s, variant]) =>
    rocks.push({ position: [x, WATER_Y + 0.05, z], scale: [s * 1.3, s * 0.55, s], rotation: [0, rand() * Math.PI, 0], variant }),
  );
  rocks.push({ position: [-7.5, WATER_Y + 3, -3], scale: [3.5, 7, 3], rotation: rot(), variant: 1 });
  rocks.push({ position: [7.8, WATER_Y + 3, -3.5], scale: [3.5, 7.5, 3], rotation: rot(), variant: 2 });
  return rocks;
}

export function Rocks({ low }: { low?: boolean }) {
  const { nodes } = useGLTF(MODEL);
  const geometries = useMemo(() => [0, 1, 2, 3].map((i) => (nodes[`rock${i}`] as THREE.Mesh).geometry), [nodes]);
  const material = useMemo(() => {
    const baked = (nodes.rock0 as THREE.Mesh).material as THREE.MeshStandardMaterial;
    // Phones: the clearcoat layer doubles the lighting cost — a plain glossy stone instead.
    if (low)
      return new THREE.MeshStandardMaterial({
        color: "#0a0b0e",
        roughness: 0.4,
        metalness: 0.2,
        envMapIntensity: 0.85,
        normalMap: baked.normalMap,
        normalScale: new THREE.Vector2(0.8, 0.8),
      });
    // Wet stone: rough rock carrying the baked detail, under a glossy film of
    // water that follows the big facets — so the facets still catch crisp light.
    return new THREE.MeshPhysicalMaterial({
      color: "#0a0b0e",
      roughness: 0.7,
      metalness: 0.1,
      envMapIntensity: 0.85,
      normalMap: baked.normalMap,
      normalScale: new THREE.Vector2(1, 1),
      clearcoat: 0.8,
      clearcoatRoughness: 0.14,
    });
  }, [nodes, low]);
  const rocks = useMemo(() => layout(), []);

  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} geometry={geometries[r.variant]} material={material} position={r.position} scale={r.scale} rotation={r.rotation} />
      ))}
    </group>
  );
}
