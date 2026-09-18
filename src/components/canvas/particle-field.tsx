"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/utils/animations/gsap";

/**
 * PLACEHOLDER SCENE — proof that WebGL and the DOM share one clock.
 *
 * A field of points whose Y rotation is SCRUBBED by document scroll via
 * ScrollTrigger. If this turns as you scroll and stops the instant you stop,
 * Lenis → GSAP → ScrollTrigger → R3F is wired correctly end to end.
 *
 * Memory: geometry and material are created once with useMemo and explicitly
 * disposed on unmount. Three.js holds GPU buffers outside the JS heap, so
 * React unmounting the component does NOT free them — a hot reload without
 * this leaks a full buffer set every save.
 */

const COUNT = 2600;
const RADIUS = 9;

export function ParticleField() {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    /* deterministic scatter — no Math.random, so SSR and client agree and the
       field does not reshuffle on every hot reload */
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = RADIUS * (0.55 + 0.45 * ((i * 37) % 100) / 100);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.62;
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color("#E8BC57"),
        size: 0.028,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  /* scroll-scrubbed Y rotation */
  useEffect(() => {
    const node = points.current;
    if (!node) return;

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      scrub: true,
      onUpdate: (self) => {
        node.rotation.y = self.progress * Math.PI * 2;
        node.rotation.x = self.progress * 0.5;
      },
    });

    return () => st.kill();
  }, []);

  /* idle drift so the scene is alive when nobody is scrolling */
  useFrame((_, delta) => {
    if (points.current) points.current.rotation.z += delta * 0.012;
  });

  /* explicit GPU teardown */
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <points ref={points} geometry={geometry} material={material} />;
}
