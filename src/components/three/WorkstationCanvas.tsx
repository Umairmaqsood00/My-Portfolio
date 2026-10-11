"use client";

import { Component, Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { Laptop } from "./Laptop";
import type { StageState } from "./stageState";

type Props = {
  state: StageState;
  /** Pause rendering entirely when the stage is off-screen. */
  active: boolean;
  onReady?: () => void;
  onError?: () => void;
};

export default function WorkstationCanvas({ state, active, onReady, onError }: Props) {
  return (
    <CanvasErrorBoundary onError={onError}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.4, 10], fov: 30, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl, camera }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          camera.lookAt(0, 0.4, 0);
          onReady?.();
        }}
        aria-hidden
      >
        <ambientLight intensity={0.18} />
        <directionalLight position={[-4, 6, 5]} intensity={1.6} color="#f4f3ec" />
        <directionalLight position={[5, 2, -4]} intensity={1.2} color="#b4ff39" />
        <pointLight position={[0, -1.5, 2]} intensity={6} distance={7} color="#b4ff39" />

        <Suspense fallback={null}>
          {/* A tiny studio built from light panels — no HDR download needed */}
          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={2.4} position={[0, 5, -2]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
            <Lightformer form="rect" intensity={1.2} position={[-5, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
            <Lightformer form="rect" intensity={0.9} color="#b4ff39" position={[5, 1, 0]} scale={[2, 6, 1]} rotation-y={-Math.PI / 2} />
            <Lightformer form="ring" intensity={1.5} position={[0, 2, 6]} scale={3} />
          </Environment>
          <Laptop state={state} />
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
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
