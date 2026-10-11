"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * "Skeleton Hand" by Zachariah Hale — CC BY 4.0
 * https://sketchfab.com/3d-models/skeleton-hand-a4bf7eabaca24985b3aa2dbfc2d369ca
 * Modified: re-materialised, posed and animated in code (credited in the footer).
 *
 * The model isn't skinned: every finger joint is its own node, so posing is a
 * rotation about each joint's local X axis on top of its rest pose.
 * Model space: fingers point +y, the palm faces -z, the thumb sits on +x.
 */

const MODEL = "/models/skeleton-hand.glb";
useGLTF.preload(MODEL);

const SCALE = 0.12;
/** Bottom-centre of the palm, in model units — becomes the hand's pivot. */
const WRIST = new THREE.Vector3(8.2, 2.35, -6.9);
/** Where the orb's centre sits when held, relative to the wrist (model units). */
const CUP = new THREE.Vector3(0, 11, -11.5);

/** Per-joint offsets from the rest pose (radians): fully open → fully gripping. */
const POSE: Record<string, { open: number[]; grip: number[] }> = {
  Pointer: { open: [-0.05, -0.15, -0.1], grip: [0.7, 0.85, 0.6] },
  Middle: { open: [-0.05, -0.15, -0.1], grip: [0.65, 0.85, 0.6] },
  Ring: { open: [-0.3, -0.75, -0.7], grip: [0.45, 0.35, 0.3] },
  Pinky: { open: [-0.5, -0.95, -0.9], grip: [0.3, 0.15, 0.1] },
  Thumb: { open: [0.25, 0.1, 0.05], grip: [-0.45, -0.35, -0.3] },
};

export type HandHandle = {
  /** wrist position in world space (read after `place`) */
  wrist: THREE.Vector3;
  /** fingertip height in world space — used to time the splash */
  tipY: number;
  /**
   * rise: 0 under water → 1 holding position · curl: 0 open → 1 gripping ·
   * spread: 0 together → 1 fanned
   */
  place: (orb: THREE.Vector3, rise: number, curl: number, spread: number) => void;
  setVisible: (v: boolean) => void;
};

const easeInOut = (x: number) => x * x * (3 - 2 * x);
const tmpCup = new THREE.Vector3();
const tmpEuler = new THREE.Euler(0, 0, 0, "YXZ");
const tmpQ = new THREE.Quaternion();
const X = new THREE.Vector3(1, 0, 0);

export const Hand = forwardRef<HandHandle>(function Hand(_, ref) {
  const { scene } = useGLTF(MODEL);
  const root = useRef<THREE.Group>(null!);
  const forearm = useRef<THREE.Group>(null!);
  const wrist = useRef(new THREE.Vector3());
  const tipY = useRef(-Infinity);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1b1c21",
        roughness: 0.3,
        metalness: 0.45,
        envMapIntensity: 1.3,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const { model, joints } = useMemo(() => {
    const model = scene.clone(true);
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = material;
    });
    const palm = model.getObjectByName("Palm")!;
    const joints = Object.keys(POSE).map((name) => {
      const chain: THREE.Object3D[] = [];
      let node = palm.children.find((c) => c.name === name);
      while (node) {
        chain.push(node);
        node = node.children.find((c) => !(c as THREE.Mesh).isMesh && c.name.startsWith("FingerSeg"));
      }
      return { name, chain, rest: chain.map((j) => j.quaternion.clone()) };
    });
    return { model, joints };
  }, [scene, material]);

  useImperativeHandle(ref, () => ({
    get wrist() {
      return wrist.current;
    },
    get tipY() {
      return tipY.current;
    },
    setVisible(v) {
      root.current.visible = v;
      forearm.current.visible = v;
    },
    place(orb, rise, curl, spread) {
      // Emerges fingers-up, then the wrist bends back so the palm turns up under the orb.
      const pitch = 0.15 + (Math.PI / 2 - 0.25) * easeInOut(Math.min(1, Math.max(0, (rise - 0.45) / 0.55)));
      const yaw = 0.6;
      tmpEuler.set(pitch, yaw, 0);
      root.current.rotation.copy(tmpEuler);

      tmpCup.copy(CUP).multiplyScalar(SCALE).applyEuler(tmpEuler);
      wrist.current.copy(orb).sub(tmpCup);
      wrist.current.y -= (1 - rise) * 7;
      root.current.position.copy(wrist.current);
      forearm.current.position.copy(wrist.current);
      forearm.current.rotation.y = yaw;
      tipY.current = wrist.current.y + 3.7 * Math.cos(pitch);

      for (const { name, chain, rest } of joints) {
        const { open, grip } = POSE[name];
        chain.forEach((joint, i) => {
          const fan = i === 0 && name !== "Thumb" ? (name === "Pointer" ? -0.12 : name === "Pinky" ? 0.12 : 0) * spread : 0;
          const angle = open[i] + (grip[i] - open[i]) * curl;
          joint.quaternion.copy(rest[i]).multiply(tmpQ.setFromAxisAngle(X, angle));
          if (fan) joint.rotateY(fan);
        });
      }
    },
  }));

  return (
    <>
      <group ref={root} visible={false}>
        <group scale={SCALE}>
          <primitive object={model} position={[-WRIST.x, -WRIST.y, -WRIST.z]} />
        </group>
      </group>
      {/* Radius and ulna: they stay vertical, disappearing into the water. */}
      <group ref={forearm} visible={false}>
        <mesh position={[0.12, -2.3, 0]} material={material}>
          <capsuleGeometry args={[0.07, 4.4, 6, 12]} />
        </mesh>
        <mesh position={[-0.13, -2.3, 0.02]} material={material}>
          <capsuleGeometry args={[0.055, 4.4, 6, 12]} />
        </mesh>
      </group>
    </>
  );
});
