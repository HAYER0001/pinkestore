"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { ParticleField } from "./particle-field";

/**
 * THE GLOBAL CANVAS.
 *
 * Fixed to the viewport, behind everything, for the whole site. 3D never lives
 * inside a scrolling div — the DOM scrolls over a stationary canvas, which is
 * the only way scroll-linked WebGL stays pinned and jank-free.
 *
 * dpr is capped at 2: uncapped devicePixelRatio on a 3x phone renders 9x the
 * pixels and is the single most common cause of a mobile WebGL build melting.
 */
export function GlobalCanvas() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100svh",
        zIndex: -1,
        pointerEvents: "none",
        /* belt and braces: a fixed full-bleed layer must never create scroll */
        overflow: "hidden",
      }}
    >
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 14], fov: 42, near: 0.1, far: 120 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#0A0B10"), 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
      >
        <ambientLight intensity={0.6} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
