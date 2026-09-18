"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { MadhubaniParticles, particleBudget } from "./MadhubaniParticles";
import { PerfHUD } from "./perf-hud";
import { CinematicScrubber } from "./CinematicScrubber";
import { CameraController } from "./CameraController";
import { PortalBackdrop } from "./PortalBackdrop";
import { canvasStore } from "@/utils/animations/canvas-store";

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
  /* Same hydration trap as the HUD: particleBudget() reads window, so it must
     not run during render. Mount-gate it. */
  /* useSyncExternalStore rather than useState+useEffect: it is tear-free and
     gives the server a stable value, so no hydration mismatch. */
  const active = useSyncExternalStore(
    canvasStore.subscribe,
    canvasStore.getActive,
    () => true,
  );

  const [budget, setBudget] = useState<number | null>(null);
  useEffect(() => setBudget(particleBudget()), []);
  const showHud = process.env.NODE_ENV === "development" && budget !== null;
  return (
    <>
    <PortalBackdrop />
    {showHud && <PerfHUD particles={budget} />}
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100svh",
        zIndex: -1,
        /* Once the shop is on screen the canvas is dead weight: hidden, inert,
           and — crucially — not rendering. */
        opacity: active ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity 700ms cubic-bezier(0.32,0.72,0,1)",
        /* belt and braces: a fixed full-bleed layer must never create scroll */
        overflow: "hidden",
      }}
    >
      <Canvas
        gl={{
          antialias: true,
          /* The portal dissolves the plane to reveal what is BEHIND the canvas.
             With an opaque clear that reveal shows nothing but the clear
             colour, so the canvas must composite transparently. */
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        /* frameloop="never" stops the R3F render loop entirely. Merely setting
           opacity:0 would keep 52k particles and a video texture rendering at
           60fps behind an invisible layer — the single worst thing you can do
           to a phone battery. */
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, 14], fov: 42, near: 0.1, far: 120 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#0A0B10"), 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
      >
        <CameraController />
        <CinematicScrubber />
        <MadhubaniParticles />
      </Canvas>
    </div>
    </>
  );
}
